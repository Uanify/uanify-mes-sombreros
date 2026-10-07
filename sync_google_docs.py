import os
import json
import argparse
from pathlib import Path
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents'
]

CLIENT_SECRET_FILE = Path(__file__).parent / 'client_secret.json'
TOKEN_FILE = Path(__file__).parent / 'token.json'

COLOR_BRAND = RGBColor(139, 94, 60)      # #8B5E3C Cuero Artesanal
COLOR_DARK = RGBColor(15, 23, 42)        # #0F172A Pizarra Oscuro
COLOR_BODY = RGBColor(30, 41, 59)        # #1E293B Texto Principal
COLOR_MUTED = RGBColor(100, 116, 139)    # #64748B Gris Secundario
COLOR_BG_CARD = "F8FAFC"
COLOR_TH_BG = "F1F5F9"

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
            json.dump(data, f)

    return creds

def get_services():
    creds = get_credentials()
    drive = build('drive', 'v3', credentials=creds)
    docs = build('docs', 'v1', credentials=creds)
    return drive, docs

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=200, right=200):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_card_borders(cell, border_color="8B5E3C"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)

def md_to_docx(md_path, docx_path, doc_title):
    doc = docx.Document()
    
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        footer = section.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run(f"Tombstone Hats MES · Uanify Software Industrial  |  {doc_title}")
        f_run.font.name = "Arial"
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = COLOR_MUTED

    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_metadata_card = False
    metadata_lines = []
    in_table = False
    table_rows = []
    in_code = False
    code_lines = []

    for line in lines:
        raw = line.rstrip('\r\n')
        stripped = raw.strip()

        if stripped.startswith('```'):
            if not in_code:
                in_code = True
                code_lines = []
            else:
                in_code = False
                tbl = doc.add_table(rows=1, cols=1)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = tbl.cell(0, 0)
                set_cell_background(cell, "0F172A")
                set_cell_margins(cell, top=160, bottom=160, left=240, right=240)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.15
                run = p.add_run('\n'.join(code_lines))
                run.font.name = "Consolas"
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(241, 245, 249)
                doc.add_paragraph().paragraph_format.space_after = Pt(4)
            continue

        if in_code:
            code_lines.append(raw)
            continue

        if stripped.startswith('>'):
            in_metadata_card = True
            metadata_lines.append(stripped.lstrip('>').strip())
            continue
        elif in_metadata_card and not stripped.startswith('>'):
            in_metadata_card = False
            tbl = doc.add_table(rows=1, cols=1)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = tbl.cell(0, 0)
            set_cell_background(cell, COLOR_BG_CARD)
            set_cell_margins(cell, top=140, bottom=140, left=220, right=220)
            set_card_borders(cell, "8B5E3C")
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.25
            
            for m_line in metadata_lines:
                parts = re.split(r'(\*\*.*?\*\*)', m_line)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        r = p.add_run(part[2:-2])
                        r.bold = True
                        r.font.name = "Arial"
                        r.font.size = Pt(9.5)
                        r.font.color.rgb = COLOR_DARK
                    else:
                        r = p.add_run(part)
                        r.font.name = "Arial"
                        r.font.size = Pt(9.5)
                        r.font.color.rgb = COLOR_BODY
                p.add_run('\n')
            p.runs[-1].text = p.runs[-1].text.rstrip('\n')
            doc.add_paragraph().paragraph_format.space_after = Pt(6)
            metadata_lines = []

        if stripped.startswith('# '):
            t_text = stripped[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            r = p.add_run(t_text)
            r.font.name = "Arial"
            r.font.size = Pt(22)
            r.bold = True
            r.font.color.rgb = COLOR_BRAND
            continue

        if stripped.startswith('## '):
            h_text = stripped[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(h_text)
            r.font.name = "Arial"
            r.font.size = Pt(14)
            r.bold = True
            r.font.color.rgb = COLOR_DARK
            continue

        if stripped.startswith('### '):
            h_text = stripped[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(h_text)
            r.font.name = "Arial"
            r.font.size = Pt(11.5)
            r.bold = True
            r.font.color.rgb = COLOR_BRAND
            continue

        if stripped in ['---', '***', '___']:
            continue

        if stripped.startswith('|') and stripped.endswith('|'):
            if '---' in stripped:
                continue
            in_table = True
            cells = [c.strip() for c in stripped[1:-1].split('|')]
            table_rows.append(cells)
            continue
        elif in_table and not (stripped.startswith('|') and stripped.endswith('|')):
            in_table = False
            if table_rows:
                num_cols = max(len(r) for r in table_rows)
                tbl = doc.add_table(rows=len(table_rows), cols=num_cols)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                for r_idx, row in enumerate(table_rows):
                    for c_idx, val in enumerate(row):
                        cell = tbl.cell(r_idx, c_idx)
                        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                        cp = cell.paragraphs[0]
                        cp.paragraph_format.space_before = Pt(0)
                        cp.paragraph_format.space_after = Pt(0)
                        
                        if r_idx == 0:
                            set_cell_background(cell, COLOR_TH_BG)
                            cr = cp.add_run(val)
                            cr.bold = True
                            cr.font.name = "Arial"
                            cr.font.size = Pt(9.5)
                            cr.font.color.rgb = COLOR_DARK
                        else:
                            bg = COLOR_BG_CARD if r_idx % 2 == 0 else "FFFFFF"
                            set_cell_background(cell, bg)
                            cr = cp.add_run(val)
                            cr.font.name = "Arial"
                            cr.font.size = Pt(9.0)
                            cr.font.color.rgb = COLOR_BODY
                doc.add_paragraph().paragraph_format.space_after = Pt(6)
            table_rows = []

        if stripped:
            p = doc.add_paragraph()
            p.paragraph_format.line_spacing = 1.25
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.space_before = Pt(0)

            content_to_parse = stripped
            if stripped.startswith('* ') or stripped.startswith('- '):
                p.paragraph_format.left_indent = Inches(0.25)
                content_to_parse = stripped[2:].strip()
                r_dot = p.add_run("▪  ")
                r_dot.font.color.rgb = COLOR_BRAND
                r_dot.font.size = Pt(9.5)
            elif re.match(r'^\d+\.\s', stripped):
                m = re.match(r'^\d+\.\s', stripped)
                p.paragraph_format.left_indent = Inches(0.25)
                num_prefix = m.group(0)
                content_to_parse = stripped[len(num_prefix):].strip()
                r_num = p.add_run(num_prefix)
                r_num.bold = True
                r_num.font.color.rgb = COLOR_DARK
                r_num.font.size = Pt(10)

            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', content_to_parse)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                    r.font.name = "Arial"
                    r.font.size = Pt(10)
                    r.font.color.rgb = COLOR_DARK
                elif part.startswith('*') and part.endswith('*') and len(part) > 2:
                    r = p.add_run(part[1:-1])
                    r.italic = True
                    r.font.name = "Arial"
                    r.font.size = Pt(10)
                    r.font.color.rgb = COLOR_BODY
                else:
                    r = p.add_run(part)
                    r.font.name = "Arial"
                    r.font.size = Pt(10)
                    r.font.color.rgb = COLOR_BODY

    doc.save(docx_path)
    return docx_path

def upload_styled_doc(file_path, folder_id=None, doc_title=None):
    """Genera DOCX nativo estilizado y lo sube como Google Doc oficial con formato editorial impecable."""
    local_p = Path(file_path)
    if not local_p.exists():
        raise FileNotFoundError(f"No existe el archivo {local_p}")

    title = doc_title or local_p.stem
    temp_docx = local_p.parent / f"{local_p.stem}_temp_styled.docx"
    
    try:
        md_to_docx(str(local_p), str(temp_docx), title)
        
        media = MediaFileUpload(
            str(temp_docx),
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            resumable=True
        )

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
            res = {'status': 'updated', 'id': doc_id, 'name': title, 'link': updated_file.get('webViewLink')}
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
            res = {'status': 'created', 'id': created_file['id'], 'name': title, 'link': created_file.get('webViewLink')}
    finally:
        if temp_docx.exists():
            try:
                temp_docx.unlink()
            except Exception:
                pass
                
    return res

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--sync-file', type=str, help='Ruta local de archivo Markdown')
    parser.add_argument('--folder-id', type=str, help='ID de carpeta destino en Drive')
    parser.add_argument('--title', type=str, help='Título del doc')

    args = parser.parse_args()
    if args.sync_file:
        res = upload_styled_doc(args.sync_file, args.folder_id, args.title)
        print(f"Sincronizado: {res['name']} ({res['status']}) -> {res.get('link')}")
