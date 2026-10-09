from pathlib import Path
from sync_google_docs import upload_styled_doc

OFICIAL_FOLDER_ID = '1oRAV8NafIg3mGhheYC-F9ZT8QnhYEV6J'
INTERNO_FOLDER_ID = '1C2Q76BXatzYyRhy2A5Bbui8wrUbTC2P6'

SYNC_PLAN = [
    # Documentos Oficiales
    {
        'local': 'docs/Oficial/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md',
        'title': 'Propuesta Técnica & Comercial – Sistema MES (MVP)',
        'folder': OFICIAL_FOLDER_ID
    },
    {
        'local': 'docs/Oficial/DIAGRAMA_DE_FLUJO_Y_MODULOS_MES.md',
        'title': 'Diagrama de Flujo del Sistema y Catálogo de Módulos (MVP)',
        'folder': OFICIAL_FOLDER_ID
    },
    {
        'local': 'docs/Oficial/BANCO_UNIFICADO_DUDAS_Y_VALIDACIONES.md',
        'title': 'Banco Unificado de Dudas y Validaciones Técnicas',
        'folder': OFICIAL_FOLDER_ID
    },
    # Documentos Internos (Únicamente los vigentes y sintetizados)
    {
        'local': 'SISTEMA_TOMBSTONE_MES.md',
        'title': 'Documento Maestro de Arquitectura y Reglas de Negocio MES',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md',
        'title': 'Requerimientos del Sistema (PRD / SRS) – Tombstone MES',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/HISTORIAS_DE_USUARIO.md',
        'title': 'Historias de Usuario (Alcance Oficial MVP) – Tombstone MES',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/CASOS_DE_PRUEBA.md',
        'title': 'Catálogo Maestro de Casos de Prueba (QA) – Tombstone MES',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/REGLAS_DE_NEGOCIO_Y_OPERACION_ACTUAL.md',
        'title': 'Reglas de Negocio y Operación Actual de Planta',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/GLOSARIO_Y_TERMINOLOGIA_PLANTA.md',
        'title': 'Glosario Oficial y Terminología de Planta',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/DIAGRAMAS_DE_FLUJO_USUARIOS.md',
        'title': 'Diagramas de Flujo y Procesos por Actor',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/guia_reunion_integracion_contpaqi.md',
        'title': 'Guía de Decisión Técnica: Integración CONTPAQi ($0 USD)',
        'folder': INTERNO_FOLDER_ID
    },
    {
        'local': 'docs/Interno/cuestionario_operativo_ingenieria_planta.md',
        'title': 'Cuestionario Operativo de Planta: Validación con Ingeniería',
        'folder': INTERNO_FOLDER_ID
    }
]

def sync_organized():
    print("Iniciando sincronización limpia y estructurada hacia Google Drive...")
    for item in SYNC_PLAN:
        local_p = Path(item['local'])
        if not local_p.exists():
            print(f"Omitiendo {local_p} (no existe)")
            continue
        print(f"-> Sincronizando: {local_p} en carpeta destino con título: '{item['title']}'")
        res = upload_styled_doc(
            file_path=str(local_p),
            folder_id=item['folder'],
            doc_title=item['title']
        )
        print(f"   Resultado: {res['status']} | Link: {res.get('link')}")

    print("\nSincronización estructurada completada exitosamente.")

if __name__ == '__main__':
    sync_organized()
