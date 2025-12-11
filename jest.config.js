export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/client/src'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@shared/(.*)$': '<rootDir>/shared/$1',
        '^@assets/(.*)$': '<rootDir>/attached_assets/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/client/src/test-utils/setup.ts'],
    collectCoverageFrom: [
        'client/src/**/*.{ts,tsx}',
        '!client/src/**/*.d.ts',
        '!client/src/main.tsx',
        '!client/src/test-utils/**',
        '!client/src/**/__tests__/**',
    ],
    coverageThresholds: {
        global: {
            branches: 70,
            functions: 70,
            lines: 80,
            statements: 80,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
};
