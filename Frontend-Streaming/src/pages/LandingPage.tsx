import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Film, Tv, Zap, Shield, Star } from 'lucide-react';

const features = [
  { icon: Film, title: 'Películas y Series', desc: 'Miles de títulos en HD y 4K para disfrutar sin límites.' },
  { icon: Tv, title: 'Multiplataforma', desc: 'Mira desde tu celular, tablet, laptop o smart TV.' },
  { icon: Zap, title: 'Sin Anuncios', desc: 'Disfruta contenido sin interrupciones molestas.' },
  { icon: Shield, title: 'Perfiles Seguros', desc: 'Crea perfiles para toda la familia con control parental.' },
];

const plans = [
  { name: 'Básico', price: 'S/15', period: '/mes', features: ['Calidad HD', '1 dispositivo', 'Catálogo completo'] },
  { name: 'Estándar', price: 'S/25', period: '/mes', features: ['Calidad Full HD', '3 dispositivos', 'Descargas', 'Sin anuncios'], popular: true },
  { name: 'Premium', price: 'S/40', period: '/mes', features: ['Calidad 4K + HDR', '5 dispositivos', 'Descargas', 'Audio espacial'] },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="netflix-gradient relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="animate-fade-in text-4xl font-black leading-tight text-foreground md:text-6xl lg:text-7xl">
            Entretenimiento <span className="text-primary">sin límites</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-fade-in text-lg text-muted-foreground opacity-0 [animation-delay:200ms] md:text-xl">
            Películas, series y documentales al alcance de tu mano. Empieza a ver hoy sin compromisos.
          </p>
          <div className="mt-8 flex animate-fade-in flex-col items-center justify-center gap-4 opacity-0 [animation-delay:400ms] sm:flex-row">
            <button
              onClick={() => navigate('/register')}
              className="glow-primary flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-all hover:scale-105"
            >
              Comenzar Ahora <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Play className="h-5 w-5" /> Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            ¿Por qué <span className="text-primary">Streamix</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-4 text-center text-3xl font-bold text-foreground md:text-4xl">
            Elige tu plan
          </h2>
          <p className="mb-12 text-center text-muted-foreground">Cancela cuando quieras. Sin permanencia.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 transition-all hover:scale-[1.02] ${
                  plan.popular ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-card'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    Más Popular
                  </span>
                )}
                <h3 className="mb-1 text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full rounded-lg py-2.5 text-sm font-bold transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  Elegir Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            ¿Listo para empezar?
          </h2>
          <p className="mt-3 text-muted-foreground">Crea tu cuenta en segundos y empieza a disfrutar.</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-6 rounded-lg bg-primary px-8 py-3 font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90"
          >
            Crear Cuenta Gratis
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
