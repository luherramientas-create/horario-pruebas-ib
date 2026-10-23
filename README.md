# Horario de Pruebas IB

Aplicación para recolectar la información de las pruebas que el personal docente aplicará en 11.º y 12.º.

## Primera fase

La aplicación se concentra únicamente en la **recolección de datos**:

1. El docente inicia sesión.
2. Selecciona 11.º o 12.º.
3. En 12.º selecciona NS o NM.
4. Selecciona la materia.
5. Marca los componentes de prueba que aplicará.
6. Revisa/edita el tiempo sugerido.
7. Indica si corresponde tiempo adicional y, si aplica, el porcentaje.
8. Guarda el registro.
9. Puede registrar otra prueba sin cerrar la aplicación.

La información se almacena en Firestore para que posteriormente pueda alimentar un panel administrativo y el generador automático de horarios.

## Reglas iniciales

- Tiempo adicional sugerido: 25 %.
- El porcentaje es editable.
- El tiempo adicional se calcula como porcentaje de la duración y se redondea al entero.
- Los tiempos sugeridos de IB se basan en el calendario de exámenes utilizado como fuente del proyecto.
- Estudios Sociales y Cívica de 11.º se registran inicialmente con 80 minutos cada una, según la especificación del proyecto.

## Estado del proyecto

Fase 1 — Recolección de datos.

La generación automática del horario y la salida a Excel/Word se incorporarán posteriormente.


## Rediseño móvil (rama redisenio-mobile-ib-2026)

**Esta rama NO está publicada en GitHub Pages.** La página principal sigue en main.

### Interfaz docente
- Google para iniciar sesión; nombre desde lista cerrada.
- Nivel 11.º/12.º y materia desde desplegables; NS/NM se resuelve internamente.
- Inglés B NM: Prueba 1 (75 min) y Prueba 2 (105 min).
- Literatura NS: únicamente Prueba 1 (135) y Prueba 2 (105).
- Estudios Sociales y Cívica: solo 11.º, una prueba de 80 min.
- Duraciones editables y apoyo aprobado opcional, porcentaje 25 % predeterminado.
- Revisión previa al guardado y confirmación explícita al actualizar una prueba existente.
- Mis registros: edición en programación activa; consulta sin edición cuando está cerrada.
- Identidad visual institucional, móvil primero, firma pequeña de Lu Herramientas.

### Gestión de docentes
- Archivo de respaldo inicial de 14 docentes en js/catalog.js.
- El panel administrativo permite agregar, editar, desactivar y reactivar docentes.
- Las modificaciones se guardan en Firestore: configuracion/docentes (campo items).
- Al inicio, si no existe ese documento, se usa la lista inicial. Al efectuar la primera modificación administrativa, se crea el documento.

### Seguridad y despliegue: instrucciones obligatorias
1. Revisar y respaldar los datos reales de Firebase antes de desplegar.
2. **Publicar y validar firestore.rules en Firebase Console o con Firebase CLI antes de activar la aplicación renovada.** Subir el archivo a GitHub NO actualiza las reglas activas.
3. Probar con cuenta administradora y cuenta docente autorizada: selección, guardado, modificación, advertencia de duplicado, registro desde celular y cierre de programación.
4. Revisar posibles registros históricos duplicados o con IDs antiguos. Las ediciones se realizan por ID del documento original; nuevas pruebas usan IDs deterministas.
5. Verificar que la lista de docentes activa coincida con las personas actuales.
6. Solo después de las pruebas, integrar la rama a main para publicar GitHub Pages.

**No usar datos reales de estudiantes durante las pruebas.** No se incluyen identidades individuales de beneficiarios de apoyos.

### Limitaciones actuales
- No hay aplicación automática del archivo firestore.rules desde GitHub.
- El repositorio carece de pruebas automatizadas; deben completarse pruebas de extremo a extremo en Firebase.
- Seleccionar un nombre no garantiza que corresponda a la identidad de Google: la cuenta autenticada y el nombre seleccionado se registran, pero la vinculación nominal no está validada contra un directorio institucional.
- Un mismo docente que cambie de cuenta Google puede requerir conciliación administrativa de registros anteriores.
