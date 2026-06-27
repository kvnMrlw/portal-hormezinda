import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Um espaco preparado para aproximar escola, familias e estudantes.'
  },
  {
    icon: ShieldCheck,
    title: 'Base segura',
    description: 'Arquitetura inicial pensada para evoluir com organizacao e confianca.'
  },
  {
    icon: Sparkles,
    title: 'Experiencia moderna',
    description: 'Interface leve, responsiva e pronta para os proximos modulos.'
  }
];

export function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-brand-lightGray via-white to-blue-100 text-brand-navy">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-soft">
              <GraduationCap aria-hidden="true" className="h-6 w-6" />
            </div>
            <span className="text-lg font-semibold">Portal Hormezinda</span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-medium text-brand-blue shadow-sm backdrop-blur">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Sistema escolar moderno
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Portal Hormezinda
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Conectando alunos, professores e comunidade escolar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-blue px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                to="/login"
              >
                Entrar
                <ArrowRight aria-hidden="true" className="h-5 w-5" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-base font-semibold text-brand-navy shadow-sm transition hover:border-blue-200 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                to="/cadastro"
              >
                Criar conta
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur md:p-6">
              <div className="rounded-[1.5rem] bg-brand-navy p-5 text-white md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-blue-100">Hoje no portal</p>
                    <h2 className="mt-1 text-2xl font-semibold">Visao inicial</h2>
                  </div>
                  <div className="rounded-2xl bg-white/12 p-3">
                    <GraduationCap aria-hidden="true" className="h-7 w-7 text-blue-100" />
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  {highlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-white/10 p-4"
                      >
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue">
                            <Icon aria-hidden="true" className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-blue-100">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-lightGray p-4">
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="mt-1 font-semibold text-brand-green">Fase 0 ativa</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">API</p>
                  <p className="mt-1 font-semibold text-brand-blue">/api/health</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
