import json
from pathlib import Path
from sync_google_docs import upload_styled_doc

TOMBSTONE_FOLDER_ID = '1Ha5sFNTo-I0qT9mK38tW9TBt7d8yRnh3'

SYNC_MAP = [
    {
        'local': 'docs/Oficial/PROPUESTA_TECNICA_MVP_TOMBSTONE_MES.md',
        'title': 'Propuesta Técnica & Comercial – Sistema MES (MVP)'
    },
    {
        'local': 'docs/Oficial/DIAGRAMA_DE_FLUJO_Y_MODULOS_MES.md',
        'title': 'Diagrama de Flujo del Sistema y Catálogo de Módulos (MVP)'
    },
    {
        'local': 'docs/Oficial/BANCO_UNIFICADO_DUDAS_Y_VALIDACIONES.md',
        'title': 'Banco Unificado de Dudas y Validaciones Técnicas'
    },
    {
        'local': 'SISTEMA_TOMBSTONE_MES.md',
        'title': 'Documento Maestro de Arquitectura y Reglas de Negocio MES'
    },
    {
        'local': 'docs/Interno/REQUERIMIENTOS_DEL_SISTEMA.md',
        'title': 'Requerimientos del Sistema (PRD / SRS) – Tombstone MES'
    },
    {
        'local': 'docs/Interno/HISTORIAS_DE_USUARIO.md',
        'title': 'Historias de Usuario (45 US) – Tombstone MES'
    },
    {
        'local': 'docs/Interno/CASOS_DE_PRUEBA.md',
        'title': 'Casos de Prueba Exhaustivos (97 TC) – QA Planta'
    },
    {
        'local': 'docs/Interno/REGLAS_DE_NEGOCIO_Y_OPERACION_ACTUAL.md',
        'title': 'Reglas de Negocio y Operación Actual de Planta'
    },
    {
        'local': 'docs/Interno/GLOSARIO_Y_TERMINOLOGIA_PLANTA.md',
        'title': 'Glosario y Terminología de Planta – Clúster SFR'
    },
    {
        'local': 'docs/Interno/DIAGRAMAS_DE_FLUJO_USUARIOS.md',
        'title': 'Diagramas de Flujo y Procesos por Actor'
    },
    {
        'local': 'docs/Interno/guia_reunion_integracion_contpaqi.md',
        'title': 'Guía de Decisión Técnica: Integración CONTPAQi ($0 USD)'
    },
    {
        'local': 'docs/Interno/1_Estrategia_Entrevista_y_Descubrimiento.md',
        'title': 'Estrategia de Entrevista y Descubrimiento Inicial'
    },
    {
        'local': 'docs/Interno/2_Banco_de_Proyectos_Hardware_y_Software.md',
        'title': 'Banco de Proyectos Hardware y Software'
    },
    {
        'local': 'docs/3_Minuta_Levantamiento_y_Propuesta_Tombstone.md',
        'title': 'Minuta de Levantamiento y Propuesta Tombstone'
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
