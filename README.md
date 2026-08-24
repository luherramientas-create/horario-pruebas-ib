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
