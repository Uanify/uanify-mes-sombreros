import json
from pathlib import Path
from sync_google_docs import get_services, upload_or_update

TOMBSTONE_FOLDER_ID = '1Ha5sFNTo-I0qT9mK38tW9TBt7d8yRnh3'

# Mapeo de archivos locales a sus respectivos Google Docs en la carpeta Tombstone Hats
SYNC_MAP = [
    {
        'local': 'docs/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md',
        'title': 'Propuesta Técnica & Comercial – Sistema MES (MVP)',
        'id': '1gfE4ZTJdeMqgfI637cVgXYB2QxgVjveAIxBbCGUDuBs'
    },
    {
        'local': 'docs/cuestionario_operativo_ingenieria_planta.md',
        'title': 'Preguntas Tecnicas – Sistema MES Tombstone Hats (MVP)',
        'id': '1QaWEGBp5HVy3MW9224a3vH0GfTGMCr9OpDMgArau4jE'
    },
    {
        'local': 'docs/REQUERIMIENTOS_DEL_SISTEMA.md',
        'title': 'Requerimientos del Sistema (PRD / SRS) – Tombstone MES',
        'id': None # Se creará si no existe en esa carpeta
    },
    {
        'local': 'docs/DUDAS_Y_VALIDACIONES_CLIENTE.md',
        'title': 'Banco Oficial de Dudas y Validaciones Técnicas',
        'id': None
    },
    {
        'local': 'SISTEMA_TOMBSTONE_MES.md',
        'title': 'Documento Maestro de Arquitectura y Reglas de Negocio MES',
        'id': None
    }
]

def sync_all():
    drive, docs = get_services()
    results = []
    for item in SYNC_MAP:
        local_path = Path(item['local'])
        if not local_path.exists():
            print(f"Saltando {local_path} (no existe)")
            continue

        title = item['title']
        print(f"\n==========================================")
        print(f"Sincronizando: {local_path} -> '{title}'")
        res = upload_or_update(
            file_path=str(local_path),
            folder_id=TOMBSTONE_FOLDER_ID,
            doc_title=title
        )
        results.append(res)
        print(f"Resultado: {res['status']} | Link: {res['link']}")

    print("\n\nSincronización completa:")
    for r in results:
        print(f"- {r['name']}: {r['link']}")

if __name__ == '__main__':
    sync_all()
