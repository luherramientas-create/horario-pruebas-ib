export const CATALOG = {
  '12': {
    NS: {
      'Lengua A: Literatura': [
        { id: 'lit-ns-p1', name: 'Prueba 1', minutes: 135 },
        { id: 'lit-ns-p2', name: 'Prueba 2', minutes: 105 },
        { id: 'lit-ns-p3', name: 'Prueba 3', minutes: null }
      ],
      'Historia': [
        { id: 'hist-ns-p1', name: 'Prueba 1', minutes: 60 },
        { id: 'hist-ns-p2', name: 'Prueba 2', minutes: 90 },
        { id: 'hist-ns-p3', name: 'Prueba 3', minutes: 150 }
      ],
      'Sociedad Digital': [
        { id: 'sd-ns-p1', name: 'Prueba 1', minutes: 135 },
        { id: 'sd-ns-p2', name: 'Prueba 2', minutes: 75 },
        { id: 'sd-ns-p3', name: 'Prueba 3', minutes: 75 }
      ]
    },
    NM: {
      'Matemática: Aplicaciones e Interpretación': [
        { id: 'mai-nm-p1', name: 'Prueba 1', minutes: 90 },
        { id: 'mai-nm-p2', name: 'Prueba 2', minutes: 90 }
      ],
      'Lengua B: Inglés': [
        { id: 'eng-nm-p1', name: 'Prueba 1', minutes: 75 },
        { id: 'eng-nm-reading', name: 'Reading', minutes: 60 },
        { id: 'eng-nm-listening', name: 'Listening', minutes: 45 }
      ],
      'Biología': [
        { id: 'bio-nm-p1', name: 'Prueba 1', minutes: 90 },
        { id: 'bio-nm-p2', name: 'Prueba 2', minutes: 90 }
      ]
    }
  },
  '11': {
    general: {
      'Estudios Sociales': [{ id: 'sociales-11', name: 'Prueba', minutes: 80 }],
      'Cívica': [{ id: 'civica-11', name: 'Prueba', minutes: 80 }]
    }
  }
};

export const DEFAULT_EXTRA_PERCENT = 25;
