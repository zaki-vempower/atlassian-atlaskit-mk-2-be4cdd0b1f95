export const expandADF = (breakoutMode = 'default', title = 'Cool cheese') => ({
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'expand',
        },
      ],
    },
    {
      type: 'expand',
      attrs: {
        title,
      },
      marks: [
        {
          type: 'breakout',
          attrs: {
            mode: breakoutMode,
          },
        },
      ],
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text:
                'Port-salut blue castello fromage. Monterey jack cut the cheese manchego taleggio emmental cheese strings cheese and wine swiss. Cheese triangles cauliflower cheese emmental cheddar say cheese who moved my cheese say cheese manchego. Feta.',
            },
          ],
        },
        {
          type: 'table',
          attrs: {
            isNumberColumnEnabled: false,
            layout: 'default',
          },
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: {},
                  content: [
                    {
                      type: 'paragraph',
                      content: [],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: {},
                  content: [
                    {
                      type: 'heading',
                      attrs: {
                        level: 3,
                      },
                      content: [
                        {
                          type: 'text',
                          text: 'Nested childExpand',
                        },
                      ],
                    },
                    {
                      type: 'nestedExpand',
                      attrs: {
                        title: 'More information about cheese',
                      },
                      content: [
                        {
                          type: 'paragraph',
                          content: [
                            {
                              type: 'text',
                              text:
                                "Hard cheese cheese and wine the big cheese. Airedale roquefort croque monsieur edam cheesy grin cheesy feet emmental ricotta. Say cheese swiss melted cheese babybel port-salut fromage when the cheese comes out everybody's happy stinking bishop.",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [],
    },
  ],
});
