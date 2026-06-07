import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const nodeGlobals = {
    ...globals.node,
};

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**"],
    },
    {
        files: ["src/**/*.ts", "tests/**/*.ts", "*.ts", "prisma/**/*.ts"],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: nodeGlobals,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
);
