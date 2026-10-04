import markdown
from bs4 import BeautifulSoup
from googleapiclient.http import MediaInMemoryUpload
from sync_google_docs import get_services

def md_to_styled_html(md_text, title="Documento"):
    # Convertir markdown a HTML con extensiones de tablas y listas
    raw_html = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'nl2br', 'sane_lists']
    )

    styled_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  body {{
    font-family: 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1E293B;
    margin: 40px;
  }}
  h1 {{
    font-size: 20pt;
    color: #8B5E3C;
    border-bottom: 2px solid #8B5E3C;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 12px;
  }}
  h2 {{
    font-size: 15pt;
    color: #0F172A;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 6px;
    margin-top: 20px;
    margin-bottom: 10px;
  }}
  h3 {{
    font-size: 12.5pt;
    color: #334155;
    margin-top: 16px;
    margin-bottom: 8px;
  }}
  p {{
    margin-bottom: 10px;
  }}
  blockquote {{
    border-left: 4px solid #8B5E3C;
    background-color: #F8FAFC;
    padding: 10px 16px;
    margin: 12px 0;
    color: #475569;
    font-style: italic;
  }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 16px 0;
    font-size: 10pt;
  }}
  th, td {{
    border: 1px solid #CBD5E1;
    padding: 8px 12px;
    text-align: left;
  }}
  th {{
    background-color: #F1F5F9;
    color: #0F172A;
    font-weight: bold;
  }}
  tr:nth-child(even) {{
    background-color: #F8FAFC;
  }}
  code {{
    background-color: #F1F5F9;
    padding: 2px 5px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: #8B5E3C;
  }}
  pre {{
    background-color: #0F172A;
    color: #F8FAFC;
    padding: 12px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    overflow-x: auto;
  }}
  ul, ol {{
    margin-left: 20px;
    margin-bottom: 12px;
  }}
  li {{
    margin-bottom: 4px;
  }}
  hr {{
    border: 0;
    height: 1px;
    background: #E2E8F0;
    margin: 24px 0;
  }}
  strong {{
    color: #0F172A;
  }}
</style>
</head>
<body>
{raw_html}
</body>
</html>
"""
    return styled_html

def upload_styled_doc(file_path, folder_id, doc_title=None):
    from pathlib import Path
    local_p = Path(file_path)
    content_md = local_p.read_text(encoding='utf-8')
    title = doc_title or local_p.stem

    styled_html = md_to_styled_html(content_md, title=title)
    media = MediaInMemoryUpload(styled_html.encode('utf-8'), mimetype='text/html', resumable=True)

    drive, docs = get_services()

    # Buscar si ya existe
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
    from pathlib import Path
    test_path = 'docs/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md'
    folder_id = '1Ha5sFNTo-I0qT9mK38tW9TBt7d8yRnh3'
    title = 'Propuesta Técnica & Comercial – Sistema MES (MVP)'
    print("Subiendo versión estilizada y formateada...")
    res = upload_styled_doc(test_path, folder_id, doc_title=title)
    print(res)
