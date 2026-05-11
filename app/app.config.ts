export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },

    table: {
      slots: {
        root: 'rounded-lg border border-muted',
        thead: 'bg-elevated/50',
        th: 'text-left text-xs uppercase tracking-wider text-muted',
        td: 'bg-default'
      }
    },
    dashboardPanel: {
      slots: {
        body: 'bg-elevated dark:bg-default'
      }
    }
  },
});
