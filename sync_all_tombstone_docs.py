import json
from pathlib import Path
from sync_google_docs import upload_styled_doc

TOMBSTONE_FOLDER_ID = '1Ha5sFNTo-I0qT9mK38tW9TBt7d8yRnh3'

SYNC_MAP = [
    {
        'local': 'docs/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md',
        'title': 'Propuesta Técnica & Comercial – Sistema MES (MVP)'
    },
    {
        'local': 'docs/cuestionario_operativo_ingenieria_planta.md',
        'title': 'Preguntas Tecnicas – Sistema MES Tombstone Hats (MVP)'
    },
    {
        'local': 'docs/REQUERIMIENTOS_DEL_SISTEMA.md',
        'title': 'Requerimientos del Sistema (PRD / SRS) – Tombstone MES'
    },
    {
        'local': 'docs/DUDAS_Y_VALIDACIONES_CLIENTE.md',
        'title': 'Banco Oficial de Dudas y Validaciones Técnicas'
    },
    {
        'local': 'SISTEMA_TOMBSTONE_MES.md',
        'title': 'Documento Maestro de Arquitectura y Reglas de Negocio MES'
    }
]

def sync_all():
    results = []
    for item in SYNC_MAP:
        local_path = Path(item['local'])
        if not local_path.exists():
            print(f"Saltando {local_path} (no existe)")
            continue

        title = item['title']
        print(f"\n==========================================")
        print(f"Sincronizando con Estilos Premium: {local_path} -> '{title}'")
        res = upload_styled_doc(
            file_path=str(local_path),
            folder_id=TOMBSTONE_FOLDER_ID,
            doc_title=title
        )
        results.append(res)
        print(f"Resultado: {res['status']} | Link: {res['link']}")

    print("\n\nSincronización completa con Formato Ejecutivo:")
    for r in results:
        print(f"- {r['name']}: {r['link']}")

if __name__ == '__main__':
    sync_all()
