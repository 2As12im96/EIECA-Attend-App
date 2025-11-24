module.exports = {
  theme: {
    extend: {
      colors: {
      },
    },
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  corePlugins: {
    colorFunctions: ({ opacityValue }) => ({
        'bg-opacity': ({ opacityValue }) => ({
            'background-color': `rgb(var(--color-bg) / ${opacityValue})`,
        }),
    }),
  },
}