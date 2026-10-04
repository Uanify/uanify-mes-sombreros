import os
import json
import argparse
from pathlib import Path
import markdown
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

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

def md_to_styled_html(md_text, title="Documento Corporativo"):
    """Convierte Markdown crudo a HTML tipográfico corporativo con estilos premium."""
    # Pre-procesar Mermaid diagrams para no romper el texto
    lines = md_text.split('\n')
    cleaned_lines = []
    in_mermaid = False
    for line in lines:
        if line.strip().startswith('```mermaid'):
            in_mermaid = True
            cleaned_lines.append('<div style="background:#F1F5F9; border:1px solid #CBD5E1; border-radius:6px; padding:12px; margin:14px 0; font-family:monospace; font-size:9pt; color:#475569;"><em>[Diagrama de Flujo del Proceso]</em><br>')
            continue
        elif in_mermaid and line.strip().startswith('```'):
            in_mermaid = False
            cleaned_lines.append('</div>')
            continue
        elif in_mermaid:
            cleaned_lines.append(f"{line}<br>")
            continue
        cleaned_lines.append(line)

    preprocessed_md = '\n'.join(cleaned_lines)

    raw_html = markdown.markdown(
        preprocessed_md,
        extensions=['tables', 'fenced_code', 'nl2br', 'sane_lists']
    )

    styled_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  body {{
    font-family: 'Arial', 'Calibri', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1E293B;
  }}
  h1 {{
    font-size: 22pt;
    font-weight: bold;
    color: #8B5E3C;
    border-bottom: 2.5px solid #8B5E3C;
    padding-bottom: 8px;
    margin-top: 28px;
    margin-bottom: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  h2 {{
    font-size: 15pt;
    font-weight: bold;
    color: #0F172A;
    border-bottom: 1.5px solid #E2E8F0;
    padding-bottom: 6px;
    margin-top: 22px;
    margin-bottom: 10px;
  }}
  h3 {{
    font-size: 12.5pt;
    font-weight: bold;
    color: #334155;
    margin-top: 16px;
    margin-bottom: 8px;
  }}
  h4 {{
    font-size: 11.5pt;
    font-weight: bold;
    color: #475569;
    margin-top: 12px;
    margin-bottom: 6px;
  }}
  p {{
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }}
  blockquote {{
    border-left: 4.5px solid #8B5E3C;
    background-color: #F8FAFC;
    padding: 10px 16px;
    margin: 14px 0;
    color: #475569;
    font-size: 10.5pt;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 18px 0;
    font-size: 9.5pt;
  }}
  th, td {{
    border: 1px solid #CBD5E1;
    padding: 8px 10px;
    vertical-align: middle;
  }}
  th {{
    background-color: #F1F5F9;
    color: #0F172A;
    font-weight: bold;
    text-align: center;
  }}
  tr:nth-child(even) {{
    background-color: #F8FAFC;
  }}
  code {{
    background-color: #F1F5F9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    color: #8B5E3C;
  }}
  pre {{
    background-color: #0F172A;
    color: #F8FAFC;
    padding: 14px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    line-height: 1.4;
  }}
  ul, ol {{
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 24px;
  }}
  li {{
    margin-bottom: 4px;
  }}
  hr {{
    border: 0;
    height: 1px;
    background: #E2E8F0;
    margin: 22px 0;
  }}
  strong {{
    color: #0F172A;
  }}
  a {{
    color: #8B5E3C;
    text-decoration: none;
    font-weight: bold;
  }}
</style>
</head>
<body>
{raw_html}
</body>
</html>
"""
    return styled_html

def upload_styled_doc(file_path, folder_id=None, doc_title=None):
    """Convierte y sube el archivo Markdown a Google Docs con formato HTML nativo enriquecido."""
    local_p = Path(file_path)
    if not local_p.exists():
        raise FileNotFoundError(f"No existe el archivo {local_p}")

    content_md = local_p.read_text(encoding='utf-8')
    title = doc_title or local_p.stem

    styled_html = md_to_styled_html(content_md, title=title)
    media = MediaInMemoryUpload(styled_html.encode('utf-8'), mimetype='text/html', resumable=True)

    drive, docs = get_services()

    # Buscar si ya existe el doc en Drive
    q = f"name = '{title}' and mimeType = 'application/vnd.google-apps.document' and trashed = false"
    if folder_id:
        q += f" and '{folder_id}' in parents"

    search = drive.files().list(q=q, fields="files(id, name, webViewLink)").execute()
    files = search.get('files', [])

    if files:
        doc_id = files[0]['id']
        updated_file = drive.files().update(
            fileId=doc_id,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        return {'status': 'updated', 'id': doc_id, 'name': title, 'link': updated_file.get('webViewLink')}
    else:
        meta = {
            'name': title,
            'mimeType': 'application/vnd.google-apps.document',
            'parents': [folder_id] if folder_id else []
        }
        created_file = drive.files().create(
            body=meta,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        return {'status': 'created', 'id': created_file['id'], 'name': title, 'link': created_file.get('webViewLink')}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sync-file', type=str, help='Ruta local de archivo Markdown')
    parser.add_argument('--folder-id', type=str, help='ID de carpeta destino en Drive')
    parser.add_argument('--title', type=str, help='Título del doc')

    args = parser.parse_args()

    if args.sync_file:
        res = upload_styled_doc(args.sync_file, folder_id=args.folder_id, doc_title=args.title)
        print(json.dumps(res, indent=2))
