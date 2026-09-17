import { prisma } from "./prisma";

export async function getConfiguracaoLoja() {
  const config = await prisma.configuracaoLoja.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return config;
}

export function vendasEstaoAbertas(config: {
  vendasAbertas: boolean;
  dataLimite: Date | null;
}): boolean {
  if (!config.vendasAbertas) return false;
  if (config.dataLimite && new Date() > config.dataLimite) return false;
  return true;
}
