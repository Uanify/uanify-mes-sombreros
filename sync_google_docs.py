import os
import json
import argparse
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents'
]

CLIENT_SECRET_FILE = Path(__file__).parent / 'client_secret.json'
TOKEN_FILE = Path(__file__).parent / 'token.json'

def get_credentials():
    if not TOKEN_FILE.exists():
        raise FileNotFoundError("token.json no existe. Ejecuta exchange_token.py primero.")

    with open(TOKEN_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(CLIENT_SECRET_FILE, 'r', encoding='utf-8') as f:
        cs = json.load(f)['installed']

    creds = Credentials(
        token=data.get('access_token'),
        refresh_token=data.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=cs['client_id'],
        client_secret=cs['client_secret'],
        scopes=SCOPES
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        data['access_token'] = creds.token
        with open(TOKEN_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

    return creds

def get_services():
    creds = get_credentials()
    drive = build('drive', 'v3', credentials=creds)
    docs = build('docs', 'v1', credentials=creds)
    return drive, docs

def list_drive_items(name_filter=None, is_folder=False):
    drive, _ = get_services()
    q = "trashed = false"
    if is_folder:
        q += " and mimeType = 'application/vnd.google-apps.folder'"
    if name_filter:
        q += f" and name contains '{name_filter}'"

    res = drive.files().list(
        q=q,
        pageSize=30,
        fields="files(id, name, mimeType, webViewLink, parents)"
    ).execute()
    return res.get('files', [])

def upload_or_update(file_path, folder_id=None, doc_title=None):
    local_p = Path(file_path)
    if not local_p.exists():
        raise FileNotFoundError(f"No existe el archivo {local_p}")

    content = local_p.read_text(encoding='utf-8')
    title = doc_title or local_p.stem

    drive, docs = get_services()

    # Buscar si ya existe
    q = f"name = '{title}' and mimeType = 'application/vnd.google-apps.document' and trashed = false"
    if folder_id:
        q += f" and '{folder_id}' in parents"

    search = drive.files().list(q=q, fields="files(id, name, webViewLink)").execute()
    files = search.get('files', [])

    if files:
        doc_id = files[0]['id']
        link = files[0].get('webViewLink')
        print(f"Actualizando Google Doc existente: '{title}' (ID: {doc_id})")

        # Limpiar y reinsertar
        doc = docs.documents().get(documentId=doc_id).execute()
        body = doc.get('body', {})
        items = body.get('content', [])
        end_idx = items[-1].get('endIndex', 1) - 1 if items else 1

        requests = []
        if end_idx > 1:
            requests.append({
                'deleteContentRange': {
                    'range': {'startIndex': 1, 'endIndex': end_idx}
                }
            })
        requests.append({
            'insertText': {
                'location': {'index': 1},
                'text': content
            }
        })
        docs.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
        return {'status': 'updated', 'id': doc_id, 'name': title, 'link': link}
    else:
        print(f"Creando nuevo Google Doc: '{title}'")
        meta = {
            'name': title,
            'mimeType': 'application/vnd.google-apps.document'
        }
        if folder_id:
            meta['parents'] = [folder_id]

        doc_file = drive.files().create(body=meta, fields='id, name, webViewLink').execute()
        doc_id = doc_file['id']
        link = doc_file.get('webViewLink')

        requests = [{
            'insertText': {
                'location': {'index': 1},
                'text': content
            }
        }]
        docs.documents().batchUpdate(documentId=doc_id, body={'requests': requests}).execute()
        return {'status': 'created', 'id': doc_id, 'name': title, 'link': link}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--folders', action='store_true', help='Listar carpetas de Drive')
    parser.add_argument('--search', type=str, help='Buscar carpetas o docs')
    parser.add_argument('--sync-file', type=str, help='Ruta local de archivo Markdown')
    parser.add_argument('--folder-id', type=str, help='ID de carpeta destino en Drive')
    parser.add_argument('--title', type=str, help='Título del doc')

    args = parser.parse_args()

    if args.folders or args.search:
        items = list_drive_items(name_filter=args.search, is_folder=args.folders)
        for i in items:
            print(f"[{i['mimeType'].split('.')[-1]}] {i['name']} | ID: {i['id']} | Link: {i.get('webViewLink')}")
    elif args.sync_file:
        res = upload_or_update(args.sync_file, folder_id=args.folder_id, doc_title=args.title)
        print(json.dumps(res, indent=2))
