// Aplica o nome do jogo a uma cópia do modelo godot-template. Roda uma única vez, logo após
// copiar o modelo, e ao final remove a si mesmo. Funciona em Windows e Linux (Node 18+).
//
// Uso: node setup.mjs --name "Meu Jogo"
// O nome do .code-workspace é derivado do nome (ex.: meu-jogo.code-workspace).
import { copyFileSync, existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const placeholder = "__GAME_NAME__";

function fail(message) {
    console.log(`ERRO: ${message}`);
    process.exit(1);
}

const args = process.argv.slice(2);
const nameIndex = args.indexOf("--name");
const name = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
if (!name || name.trim() === "") {
    fail('informe o nome do jogo: node setup.mjs --name "Meu Jogo"');
}
// Aspas e barras quebrariam a string em project.godot.
if (/["\\]/.test(name)) {
    fail(`nome inválido: '${name}'. Não use aspas nem barra invertida.`);
}

// Remove acentos e troca o que não for letra/dígito por hífen: "Ação Já" -> "acao-ja"
const slug = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
if (!slug) {
    fail(`não foi possível derivar um nome de arquivo de '${name}'.`);
}

const placeholderFiles = [join(root, "game", "project.godot"), join(root, "game", "AGENTS.md")];
const workspaceTemplate = join(root, "game.code-workspace");
const workspaceTarget = join(root, `${slug}.code-workspace`);

// Verifica tudo antes de alterar qualquer arquivo, para não deixar o setup pela metade.
for (const file of placeholderFiles) {
    if (!existsSync(file)) {
        fail(`arquivo não encontrado: ${file}`);
    }
    if (!readFileSync(file, "utf8").includes(placeholder)) {
        fail(`'${placeholder}' não encontrado em ${file}. O setup já foi aplicado?`);
    }
}
if (!existsSync(workspaceTemplate)) {
    fail(`arquivo não encontrado: ${workspaceTemplate}`);
}
if (workspaceTarget !== workspaceTemplate && existsSync(workspaceTarget)) {
    fail(`já existe ${workspaceTarget}.`);
}

// 1. Nome do jogo
for (const file of placeholderFiles) {
    writeFileSync(file, readFileSync(file, "utf8").replaceAll(placeholder, name), "utf8");
    console.log(`OK: nome aplicado em ${file}`);
}

// 2. Workspace do VS Code. O caminho do Godot não vai nele: cada pessoa define
//    godotTools.editorPath.godot4 nas configurações de usuário do VS Code.
if (workspaceTarget !== workspaceTemplate) {
    renameSync(workspaceTemplate, workspaceTarget);
}
console.log(`OK: workspace ${slug}.code-workspace`);

// 3. README.md e LEIA-ME.md do modelo são guias de setup; o projeto novo começa com um README próprio.
writeFileSync(
    join(root, "README.md"),
    `# ${name}\n\n## Colaborar\n\nContribuições por fork e pull request. Com agente de IA: \`/configurar\`, \`/colaborar\` e \`/fim\`, dentro de \`game/\`. Sem agente: [COLABORAR-SEM-IA.md](COLABORAR-SEM-IA.md).\n`,
    "utf8",
);
console.log("OK: README.md do projeto criado");
const leiaMe = join(root, "LEIA-ME.md");
if (existsSync(leiaMe)) {
    rmSync(leiaMe);
    console.log("OK: LEIA-ME.md do modelo removido");
}

// 4. .env local, a partir do modelo, com o GODOT_PATH do ambiente se ele existir.
const envFile = join(root, "game", ".env");
if (!existsSync(envFile)) {
    copyFileSync(join(root, "game", ".env.example"), envFile);
    if (process.env.GODOT_PATH) {
        const text = readFileSync(envFile, "utf8").replace(/^GODOT_PATH=.*$/m, `GODOT_PATH=${process.env.GODOT_PATH}`);
        writeFileSync(envFile, text, "utf8");
        console.log("OK: game/.env criado com o GODOT_PATH do ambiente");
    } else {
        console.log("AVISO: game/.env criado; preencha GODOT_PATH com o caminho do executável do Godot.");
    }
}

rmSync(fileURLToPath(import.meta.url));

console.log("\nSetup concluído. Próximos passos:");
console.log(`  1. git init -b main  (na pasta ${root}) e git remote add origin <url>`);
console.log(`  2. Abrir ${slug}.code-workspace no VS Code`);
console.log("  3. Em game/: node scripts/check.mjs");
