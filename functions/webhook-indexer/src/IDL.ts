export type BonkBoardProgram = {
  version: '0.1.0';
  name: 'bonk_board_program';
  instructions: [
    {
      name: 'initializeBoard';
      accounts: [
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
          docs: ['The authority for the board'];
        },
        {
          name: 'boardAccount';
          isMut: true;
          isSigner: true;
          docs: ['The Board account that contains metadata for the board'];
        },
        {
          name: 'boardDataAccount';
          isMut: true;
          isSigner: false;
          docs: [
            'The BoardData account that contains pixel data for the board'
          ];
        },
        {
          name: 'feeAccount';
          isMut: true;
          isSigner: false;
          docs: [
            '(PDA) The Fee account that contains fee metadata for the board'
          ];
        },
        {
          name: 'feeDestination';
          isMut: false;
          isSigner: false;
          docs: ['The fee destination account for fee account'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'feeAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'draw';
      accounts: [
        {
          name: 'payer';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'payerTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'boardAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'feeAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'feeDestination';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'boardDataAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'pixels';
          type: {
            vec: {
              defined: 'Pixel';
            };
          };
        }
      ];
    },
    {
      name: 'closeBoard';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rentReceiver';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'boardAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'boardDataAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'feeAccount';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'updateFeeAmount';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'boardAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'feeAccount';
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'feeAmount';
          type: 'u64';
        }
      ];
    },
    {
      name: 'updateFeeDestination';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'boardAccount';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'feeAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'newFeeDestination';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'board';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            docs: ['The authority authorized to set fees and burn rate'];
            type: 'publicKey';
          },
          {
            name: 'lastUpdated';
            docs: ['The unix epoch of the time of the last update'];
            type: 'i64';
          },
          {
            name: 'boardDataAccount';
            docs: ['The pubkey of the BoardData account'];
            type: 'publicKey';
          }
        ];
      };
    },
    {
      name: 'boardData';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'data';
            type: {
              array: ['u8', 750000];
            };
          }
        ];
      };
    },
    {
      name: 'fee';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'feeDestination';
            docs: ['Token account to accept the fee'];
            type: 'publicKey';
          },
          {
            name: 'feeAmount';
            docs: [
              "The atomic unit of fee amount in fee destination's token mint to pay per draw ix"
            ];
            type: 'u64';
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'Coord';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'x';
            type: 'u16';
          },
          {
            name: 'y';
            type: 'u16';
          }
        ];
      };
    },
    {
      name: 'Color';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'r';
            type: 'u8';
          },
          {
            name: 'g';
            type: 'u8';
          },
          {
            name: 'b';
            type: 'u8';
          }
        ];
      };
    },
    {
      name: 'Pixel';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'coord';
            type: {
              defined: 'Coord';
            };
          },
          {
            name: 'color';
            type: {
              defined: 'Color';
            };
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: 'InternalError';
      msg: 'InternalError';
    },
    {
      code: 6001;
      name: 'InvalidPayerTokenAccount';
      msg: 'The provided payer fee account is invalid';
    },
    {
      code: 6002;
      name: 'InvalidCoordinateValue';
      msg: 'The provided coordinate is out of range';
    },
    {
      code: 6003;
      name: 'InvalidBoardAccount';
      msg: 'The provided board account does not match the board data account';
    },
    {
      code: 6004;
      name: 'InvalidFeeDestination';
      msg: 'The provided fee destination is not valid';
    },
    {
      code: 6005;
      name: 'InvalidAuthority';
      msg: 'The provided authority is not valid';
    }
  ];
};

export const BONK_BOARD_IDL: BonkBoardProgram = {
  version: '0.1.0',
  name: 'bonk_board_program',
  instructions: [
    {
      name: 'initializeBoard',
      accounts: [
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
          docs: ['The authority for the board'],
        },
        {
          name: 'boardAccount',
          isMut: true,
          isSigner: true,
          docs: ['The Board account that contains metadata for the board'],
        },
        {
          name: 'boardDataAccount',
          isMut: true,
          isSigner: false,
          docs: [
            'The BoardData account that contains pixel data for the board',
          ],
        },
        {
          name: 'feeAccount',
          isMut: true,
          isSigner: false,
          docs: [
            '(PDA) The Fee account that contains fee metadata for the board',
          ],
        },
        {
          name: 'feeDestination',
          isMut: false,
          isSigner: false,
          docs: ['The fee destination account for fee account'],
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'draw',
      accounts: [
        {
          name: 'payer',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'payerTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'boardAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'feeDestination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'boardDataAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'pixels',
          type: {
            vec: {
              defined: 'Pixel',
            },
          },
        },
      ],
    },
    {
      name: 'closeBoard',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rentReceiver',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'boardAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'boardDataAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'updateFeeAmount',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'boardAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'feeAccount',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'feeAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'updateFeeDestination',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'boardAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'feeAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'newFeeDestination',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'board',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            docs: ['The authority authorized to set fees and burn rate'],
            type: 'publicKey',
          },
          {
            name: 'lastUpdated',
            docs: ['The unix epoch of the time of the last update'],
            type: 'i64',
          },
          {
            name: 'boardDataAccount',
            docs: ['The pubkey of the BoardData account'],
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'boardData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'data',
            type: {
              array: ['u8', 750000],
            },
          },
        ],
      },
    },
    {
      name: 'fee',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'feeDestination',
            docs: ['Token account to accept the fee'],
            type: 'publicKey',
          },
          {
            name: 'feeAmount',
            docs: [
              "The atomic unit of fee amount in fee destination's token mint to pay per draw ix",
            ],
            type: 'u64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'Coord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'x',
            type: 'u16',
          },
          {
            name: 'y',
            type: 'u16',
          },
        ],
      },
    },
    {
      name: 'Color',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'r',
            type: 'u8',
          },
          {
            name: 'g',
            type: 'u8',
          },
          {
            name: 'b',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'Pixel',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'coord',
            type: {
              defined: 'Coord',
            },
          },
          {
            name: 'color',
            type: {
              defined: 'Color',
            },
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InternalError',
      msg: 'InternalError',
    },
    {
      code: 6001,
      name: 'InvalidPayerTokenAccount',
      msg: 'The provided payer fee account is invalid',
    },
    {
      code: 6002,
      name: 'InvalidCoordinateValue',
      msg: 'The provided coordinate is out of range',
    },
    {
      code: 6003,
      name: 'InvalidBoardAccount',
      msg: 'The provided board account does not match the board data account',
    },
    {
      code: 6004,
      name: 'InvalidFeeDestination',
      msg: 'The provided fee destination is not valid',
    },
    {
      code: 6005,
      name: 'InvalidAuthority',
      msg: 'The provided authority is not valid',
    },
  ],
};
