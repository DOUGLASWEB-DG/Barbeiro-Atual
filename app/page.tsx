"use client"

import Link from 'next/link'
import { Scissors, Clock, Star, MapPin, Phone, Instagram, MessageCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring, motion } from "framer-motion"

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  // Extrai apenas os números (ex: "500+" vira 500)
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""))
  
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 90,
  })

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue)
    }
  }, [isInView, motionValue, numericValue])

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        const isDecimal = value.includes(".")
        const formatted = isDecimal 
          ? latest.toFixed(1) 
          : Math.floor(latest).toLocaleString()
        
        // Adiciona o sufixo original (como o "+") de volta
        ref.current.textContent = formatted + (value.includes("+") ? "+" : "")
      }
    })
  }, [springValue, value])

  return <span ref={ref}>0</span>
}

const WHATSAPP_NUMBER = '5569981050573'

const services = [
  {
     name: 'Corte Clássico',
     price: 35,
     duration: '30 min',
     desc: 'Corte na tesoura ou máquina sob medida para seu estilo',
     image: 'https://images.pexels.com/photos/32329615/pexels-photo-32329615.jpeg' 
  }, 
  {
     name: 'Barba',
     price: 20, 
     duration: '20 min', 
     desc: 'Alinhamento e modelagem de barba com acabamento impecável',
     image: 'https://images.pexels.com/photos/18298041/pexels-photo-18298041.jpeg' 
  },
  { 
    name: 'Corte + Barba', 
    price: 50, 
    duration: '50 min',
    desc: 'Pacote completo — nosso serviço mais procurado',
    image: 'https://images.pexels.com/photos/1813346/pexels-photo-1813346.jpeg' 
  },
  {
     name: 'Barboterapia', 
     price: 40, 
     duration: '40 min', 
     desc: 'Barba com toalha quente e navalha tradicional',
     image: 'https://images.pexels.com/photos/12304504/pexels-photo-12304504.jpeg ' 
  },
  { 
    name: 'Corte Infantil', 
    price: 25, 
    duration: '25 min', 
    desc: 'Cortes para crianças até 12 anos',
    image: 'https://images.pexels.com/photos/19664866/pexels-photo-19664866.jpeg' 
  },
]

const reasons = [
  'Barbeiros experientes com mais de 10 anos de profissão',
  'Ambiente limpo e premium',
  'Agendamento flexível, 7 dias por semana',
  'Satisfação garantida em cada corte',
]

function buildWhatsAppLink(serviceName?: string, date?: string, time?: string) {
  const msg = serviceName
    ? `Olá! Gostaria de agendar um(a) ${serviceName}${date ? ` no dia ${date}` : ''}${time ? ` às ${time}` : ''}. Esse horário está disponível?`
    : `Olá! Gostaria de agendar um horário. Quais horários estão disponíveis?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/logo-macedo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1.5" 
              />
          </div>
          <span className="text-base font-bold font-serif text-foreground">BARBEIRO ATUAL</span>
        </div>
        
        <div className="flex items-center gap-2">
          <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-success/40 text-success hover:bg-success/10 gap-2 hidden sm:flex">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </a>
          <Link href="/book">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              Agendar <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, hsl(38 92% 50%) 0, hsl(38 92% 50%) 1px, transparent 0, transparent 50%)',
            backgroundSize: '30px 30px'
          }} />
        </div>

        

        <div className="relative text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="text-xs text-primary font-medium tracking-wider uppercase">Agendamentos Abertos</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif text-balance leading-tight mb-6">
            A Arte do<br />
            <span className="text-primary">Corte Perfeito</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Experiência premium em barbearia. Cortes de excelência, barbas impecáveis e serviços de grooming sob medida para o seu estilo.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/book">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base gap-2">
                Agendar Horário
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="h-12 px-7 text-base border-success/40 text-success hover:bg-success/10 gap-2">
                <MessageCircle className="w-4 h-4" />
                Agendar via WhatsApp
              </Button>
            </a>
          </div>

         {/* Stats */}
<div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
  {[
    { value: '500+', label: 'Clientes Satisfeitos' },
    { value: '6+', label: 'Anos de Experiência' },
    { value: '4.9', label: 'Avaliação' },
  ].map((stat, index) => (
    <motion.div 
      key={stat.label} 
      className="text-center min-w-[120px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <p className="text-3xl font-bold font-serif text-primary">
        <Counter value={stat.value} />
      </p>
      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter">
        {stat.label}
      </p>
    </motion.div>
  ))}
</div>  
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs text-primary tracking-widest uppercase font-semibold mb-2">O Que Oferecemos</p>
          <h2 className="text-4xl font-bold font-serif text-balance">Nossos Serviços</h2>
        </div>

       {/* Serviços com Fotos */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {services.map((svc) => (
    <div
      key={svc.name}
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 transition-all group shadow-sm hover:shadow-md"
    >
      {/* Container da Imagem */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={svc.image} 
          alt={svc.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay de Gradiente para dar leitura ao preço sobre a foto se quiser, 
            ou mantemos o preço no corpo do card para ficar mais limpo: */}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
           <p className="text-sm font-bold text-primary">R${svc.price}</p>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5 flex flex-col flex-grow gap-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">{svc.name}</p>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <Clock className="w-3 h-3" />
            {svc.duration}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {svc.desc}
        </p>

        <a
          href={buildWhatsAppLink(svc.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-2"
        >
          <Button
            variant="outline"
            className="w-full gap-2 border-border group-hover:border-primary group-hover:text-primary transition-colors bg-secondary/30"
          >
            <MessageCircle className="w-4 h-4" />
            Agendar
          </Button>
        </a>
      </div>
    </div>
  ))}

  {/* CTA Card adaptado para manter a altura */}
  <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center sm:col-span-2 lg:col-span-1 min-h-[350px]">
    <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
      <Star className="w-7 h-7 text-primary fill-primary/20" />
    </div>
    <div className="space-y-2">
      <p className="text-lg font-bold text-foreground">Pacote Personalizado?</p>
      <p className="text-sm text-muted-foreground px-4">Fale conosco sobre uma combinação de serviços sob medida</p>
    </div>
    <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full max-w-[200px]">
      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
        <MessageCircle className="w-4 h-4" />
        Fale Conosco
      </Button>
    </a>
  </div>
</div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs text-primary tracking-widest uppercase font-semibold mb-2">Sobre Nós</p>
            <h2 className="text-4xl font-bold font-serif text-balance mb-4">
              Feito com Precisão
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Acreditamos que cada cliente merece uma experiência incrível — não apenas um corte de cabelo. 
              Nossa barbearia é construída sobre habilidade, estilo e atenção aos detalhes. 
              Seja um corte clássico ou um estilo moderno, nós temos o que você precisa.
            </p>
            <div className="flex flex-col gap-3">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Horários */}
          <div className="bg-background border border-border rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Horário de Funcionamento</h3>
            </div>
            {[
              { day: 'Segunda – Sexta', time: '09:00 – 19:00' },
              { day: 'Sábado', time: '08:00 – 18:00' },
              { day: 'Domingo', time: '10:00 – 16:00' },
            ].map((row) => (
              <div key={row.day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{row.day}</span>
                <span className="text-sm font-semibold text-foreground">{row.time}</span>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/book">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Agendar Horário <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif text-balance">Encontre-nos</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: 'Endereço', value: 'Av. Carlos Gomes, 1234 — Porto Velho, RO' },
            { icon: Phone, label: 'Telefone', value: '(69) 9 9999-9999' },
            { icon: Instagram, label: 'Instagram', value: '@barberos.pvh' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 border-t border-border bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-serif text-balance mb-3">Pronto para um Corte Novo?</h2>
          <p className="text-muted-foreground mb-6">Agende online em segundos ou mande uma mensagem no WhatsApp</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/book">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 gap-2">
                Agendar Online <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="h-12 px-8 border-success/40 text-success hover:bg-success/10 gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Scissors className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold font-serif text-foreground">BarberOS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BarberOS. Todos os direitos reservados.
          </p>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Área do Barbeiro
          </Link>
        </div>
      </footer>
    </div>
  )
}
