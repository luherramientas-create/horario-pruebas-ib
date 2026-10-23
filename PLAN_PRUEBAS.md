# Plan de validación antes de publicar

## Preparación
- [ ] Revisar qué programación está activa en Firebase y cerrar la anterior si corresponde.
- [ ] Confirmar que los registros históricos pueden quedar archivados; **no borrarlos como parte del despliegue**.
- [ ] Copiar las reglas actuales de Firebase para permitir reversión.
- [ ] Publicar y validar `firestore.rules` desde esta rama en Firebase Console. **No basta con tenerlas en GitHub**.
- [ ] Confirmar los dominios autorizados para Google Authentication, incluida la dirección github.io.

## Pruebas de docente
- [ ] Iniciar sesión con Google en Android Chrome y en iPhone Safari.
- [ ] Seleccionar docente, nivel y materia desde listas desplegables.
- [ ] Confirmar que Cívica y Estudios Sociales aparecen solo en 11.º.
- [ ] Verificar que Literatura NS solo presenta P1 y P2; Inglés B NM solo P1 y P2.
- [ ] Registrar dos pruebas de una materia y comprobar el tiempo predeterminado.
- [ ] Cambiar manualmente la duración; verificar cálculo de 25 % y porcentaje personalizado.
- [ ] Guardar registro y comprobarlo en Firestore y en «Mis registros».
- [ ] Editar un registro y confirmar que no aparece duplicado.
- [ ] Reintentar la misma prueba y verificar que aparece la advertencia antes de actualizar.
- [ ] Confirmar que la fecha de creación se preserva al editar.
- [ ] Desconectar la red durante el guardado y comprobar que la aplicación conserva el formulario y muestra un error.

## Pruebas de administrador
- [ ] Añadir un docente a la lista, modificar su nombre y desactivarlo.
- [ ] Comprobar que las modificaciones se ven en la interfaz docente.
- [ ] Comprobar que una cuenta no administradora no puede editar la lista en Firestore.
- [ ] Consultar resultados y filtrar por programación, nivel y materia.
- [ ] Cerrar la programación: la app no debe permitir nuevos registros ni ediciones.
- [ ] Confirmar que los registros históricos siguen en modo consulta.

## Criterios de publicación
- [ ] Validar pruebas con Google y Firebase en datos reales de una **programación de ensayo**, no la vigente.
- [ ] Verificar que no se perdió ninguna información anterior.
- [ ] Fusionar el PR de desarrollo únicamente después de cumplir el plan.

> La demostración en `vista-previa/` no usa Firebase y es independiente de esta validación.
