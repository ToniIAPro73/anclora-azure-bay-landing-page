"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import HubSpotScript from "./HubSpotScript";
import { Button } from "@/components/ui/button";
import {
  Globe,
  MapPin,
  Home,
  Star,
  Users,
  Phone,
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  CheckCircle2,
  Download,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
const ALTCHA_TRANSLATIONS: Record<
  "es" | "en",
  {
    label: string;
    verified: string;
    failed: string;
  }
> = {
  es: {
    label: "Verificación privada (ALTCHA)",
    verified: "✓ Verificado",
    failed: "Intenta nuevamente",
  },
  en: {
    label: "Private verification (ALTCHA)",
    verified: "✓ Verified",
    failed: "Try again",
  },
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "altcha-widget": JSX.IntrinsicElements["div"] & {
        challengeurl: string;
        name?: string;
        hidefooter?: string;
        hidelogo?: string;
        strings?: string;
        language?: "es" | "en";
        theme?: string;
      };
    }
  }
}

const SITE_URL = "https://azurebay-meridiangroup.vercel.app/";

type LeadAutomationPayload = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  language: "es" | "en";
  page?: string;
  timestamp?: string;
  dossierFileName?: string;
  utm: Record<string, string>;
  workflow?: string;
  altchaPayload: string;
};

type LeadAutomationResult = {
  success: boolean;
  hubspot_success?: boolean;
  pdf_success?: boolean;
  pdf_url?: string | null;
  message?: string;
};

type LeadFieldKey = "firstName" | "lastName" | "email" | "privacy" | "captcha";

export default function PlayaVivaLanding() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [activeGalleryTab, setActiveGalleryTab] = useState<
    "servicios" | "interior" | "sitios" | "video"
  >("servicios");
  const [animationStates, setAnimationStates] = useState({
    backgroundImage: false,
    logo: false,
    subtitle: false,
    description: false,
    priceBox: false,
    ctaButtons: false,
    scrollIndicator: false,
  });
  const [visibleSections, setVisibleSections] = useState({
    wynnEffect: false,
    investment: false,
    features: false,
    gallery: false,
    apartments: false,
    trust: false,
    location: false,
    faq: false,
    leadForm: false,
    footer: false,
  });

  const [showMenu, setShowMenu] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollPosition, setScrollPosition] = useState<
    "top" | "middle" | "bottom"
  >("top");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [automationFeedback, setAutomationFeedback] = useState<{
    type: "success" | "error";
    userName: string;
  } | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [hasLoadedHubSpotScript, setHasLoadedHubSpotScript] = useState(false);
  const [validationMessage, setValidationMessage] = useState<{
    field: LeadFieldKey;
    message: string;
  } | null>(null);
  const [activeApartment, setActiveApartment] = useState<
    "studio" | "oneBed" | "twoBed" | "threeBed"
  >("studio");
  const [activePlayaVivaTab, setActivePlayaVivaTab] = useState(0);
  const [locationView, setLocationView] = useState<"map" | "collage">("map");
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const altchaRef = useRef<HTMLDivElement>(null);

  // Fit hero to viewport height (especially for mobile landscape)
  const heroStackRef = useRef<HTMLDivElement>(null);
  const [heroScale, setHeroScale] = useState(1);

  const fitHeroToViewport = () => {
    const el = heroStackRef.current;
    if (!el) return;
    const navOffset = window.innerHeight <= 500 ? 80 : 24;
    const available = window.innerHeight - navOffset;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, available / rect.height);
    setHeroScale(scale > 0 ? scale : 1);
  };

  useEffect(() => {
    const startAnimationSequence = () => {
      // Background aparece inmediatamente y se espera 3seg
      setAnimationStates((prev) => ({ ...prev, backgroundImage: true }));

      // Logo aparece después de 3seg de espera, dura 2.5seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, logo: true }));
      }, 3000);

      // Subtítulo (AL MARJAN ISLAND) - empieza después del logo (3+2.5=5.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, subtitle: true }));
      }, 5500);

      // Descripción - empieza después del subtítulo (5.5+2=7.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, description: true }));
      }, 7500);

      // Price box - empieza después de descripción (7.5+2=9.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, priceBox: true }));
      }, 9500);

      // Botón CTA - empieza después de price box (9.5+2=11.5seg), dura 2seg
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, ctaButtons: true }));
      }, 11500);

      // Scroll indicator - empieza después del botón (11.5+2=13.5seg)
      setTimeout(() => {
        setAnimationStates((prev) => ({ ...prev, scrollIndicator: true }));
      }, 13500);
    };
    startAnimationSequence();
  }, []);

  useEffect(() => {
    fitHeroToViewport();
  }, []);
  useEffect(() => {
    let resizeRaf: number | null = null;

    const scheduleResize = () => {
      if (resizeRaf !== null) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = null;
        fitHeroToViewport();
      });
    };

    window.addEventListener("resize", scheduleResize, { passive: true });
    window.addEventListener("orientationchange", scheduleResize);

    return () => {
      if (resizeRaf !== null) {
        window.cancelAnimationFrame(resizeRaf);
      }
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("orientationchange", scheduleResize);
    };
  }, []);

  // Clear validation message when language changes
  useEffect(() => {
    if (validationMessage) {
      setValidationMessage(null);
    }
  }, [language, validationMessage]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let scrollRaf: number | null = null;

    const updateScrollState = () => {
      const currentScroll = window.scrollY;

      // Calculate scroll progress for hero section (0 to 1)
      const heroHeight = window.innerHeight;
      const progress = Math.min(currentScroll / heroHeight, 1);
      setScrollProgress(progress);

      // Show navbar after scrolling past hero section
      setShowNavbar(currentScroll > window.innerHeight * 0.8);

      // Determine scroll position for navigation buttons
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollableHeight = scrollHeight - clientHeight;
      const scrollPercentage =
        scrollableHeight > 0 ? (currentScroll / scrollableHeight) * 100 : 0;

      if (scrollPercentage < 15) {
        setScrollPosition("top");
      } else if (scrollPercentage > 85) {
        setScrollPosition("bottom");
      } else {
        setScrollPosition("middle");
      }

      const checkSectionVisibility = (
        ref: React.RefObject<HTMLDivElement | null>,
        sectionKey: keyof typeof visibleSections
      ) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        setVisibleSections((prev) => ({
          ...prev,
          [sectionKey]: isVisible || currentScroll > 300,
        }));
      };
      checkSectionVisibility(wynnEffectRef, "wynnEffect");
      checkSectionVisibility(investmentRef, "investment");
      checkSectionVisibility(featuresRef, "features");
      checkSectionVisibility(galleryRef, "gallery");
      checkSectionVisibility(apartmentsRef, "apartments");
      checkSectionVisibility(trustRef, "trust");
      checkSectionVisibility(locationRef, "location");
      checkSectionVisibility(faqRef, "faq");
      checkSectionVisibility(leadFormRef, "leadForm");
      checkSectionVisibility(footerRef, "footer");
      scrollRaf = null;
    };

    const onScroll = () => {
      if (scrollRaf !== null) return;
      scrollRaf = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollState();

    return () => {
      if (scrollRaf !== null) {
        window.cancelAnimationFrame(scrollRaf);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      const globalAny = window as any;
      if (!globalAny.__altchaI18nLoaded) {
        try {
          await import("altcha/i18n/all");
          globalAny.__altchaI18nLoaded = true;
        } catch (error) {
          console.error("[ALTCHA] Unable to load i18n bundle:", error);
          return;
        }
      }

      if (cancelled) return;
      const registry = globalAny.altchaI18n;
      if (!registry) return;

      (["es", "en"] as const).forEach((locale) => {
        registry.set(locale, {
          ...(registry.get(locale) ?? {}),
          ...ALTCHA_TRANSLATIONS[locale],
        });
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (privacyAccepted && !hasLoadedHubSpotScript) {
      setHasLoadedHubSpotScript(true);
    }
  }, [privacyAccepted, hasLoadedHubSpotScript]);

  const wynnEffectRef = useRef<HTMLDivElement>(null);
  const investmentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const apartmentsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const leadFormRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const content = {
    es: {
      hero: {
        title: "Azure Bay",
        subtitle: "VISTA MARINA, COSTA DEL SOL PREMIUM",
        description:
          "Caso de estudio (portfolio): complejo residencial ficticio frente al mar, impulsado por la futura Azure Grand Marina (primavera 2027). Proyecciones orientativas.",
        price: "Desde €198.000",
        payment: "Pague solo 1% mensual durante 5 años",
        handover: "Entrega Q3 2026",
        cta1: "Descargar Dossier",
        cta2: "Reservar Ahora",
      },
      menu: {
        wynnEffect: "El Efecto Marina",
        investment: "Inversión",
        features: "Características",
        gallery: "Galería",
        apartments: "Apartamentos",
        location: "Ubicación",
        faq: "FAQ",
      },
      wynnEffect: {
        title: "El Efecto Marina",
        subtitle: "El catalizador que está transformando Azure Bay District",
        description:
          "La futura Azure Grand Marina & Signature Boulevard (apertura prevista en primavera de 2027) está atrayendo inversión, turismo y nueva demanda residencial. El mercado se posiciona antes del hito para capturar el ciclo completo de apreciación del waterfront.",
        stats: [
          {
            icon: TrendingUp,
            value: "+32%",
            label: "Impulso de demanda",
            sublabel: "Proyección 2025–2027",
          },
          {
            icon: DollarSign,
            value: "€3.4B",
            label: "Inversión en distrito",
            sublabel: "Marina + boulevard + retail",
          },
          {
            icon: Calendar,
            value: "Prim. 2027",
            label: "Apertura Marina",
            sublabel: "Hito de consolidación",
          },
        ],
        urgency: {
          title: "¿Por qué posicionarse AHORA?",
          description:
            "Los inversores sofisticados se adelantan a la apertura de la marina y a la activación del paseo comercial. Azure Bay se entrega en Q3 2026, para capturar la ventana de apreciación previa y posterior al lanzamiento.",
          countdown: "Entrega: Q3 2026 • Apertura Marina: Primavera 2027",
        },
      },
      features: {
        // FEATURES_1: Development Structure
        development: {
          title: "Estructura del Desarrollo",
          tagline: "Arquitectura contemporánea frente al mar",
          description: [
            "Tres torres icónicas que combinan elegancia atemporal con el entorno costero de Azure Bay District.",
            "Diseño arquitectónico que maximiza vistas panorámicas al mar abierto desde cada residencia.",
          ],
          image: "/assets/imagenes/collage_estructura.webp",
        },
        // FEATURES_2: Specifications
        specifications: {
          title: "Especificaciones",
          tagline: "Detalles que definen la excelencia",
          cards: [
            {
              title: "Studios",
              size: "27,87-42,9 m²",
              price: "Desde 192.000€",
              features: "Cocina integrada, baño premium, balcón privado",
            },
            {
              title: "1 Dormitorio",
              size: "55,74-78,97 m²",
              price: "Desde 325.000€",
              features: "Suite en-suite, vestidor, zona de lavandería",
            },
            {
              title: "2 Dormitorios",
              size: "102,19-111,48 m²",
              price: "Desde 540.000€",
              features: "Dos suites, cocina isla, balcones duales",
            },
            {
              title: "3 Dormitorios",
              size: "157,94-167,22 m²",
              price: "Desde 740.000€",
              features: "Master suite, cuarto de servicio, terraza 25m²",
            },
          ],
        },
        // FEATURES_3: Azure Bay Views
        playaViva: {
          title: "Azure Bay",
          tagline: "Cuatro perspectivas de vida frente al mar",
          tabs: [
            {
              label: "Comunidad Costera",
              image: "/assets/imagenes/view1.webp",
              description: "Comunidad exclusiva en primera línea de playa",
            },
            {
              label: "Diseño Inspirador",
              image: "/assets/imagenes/view2.webp",
              description:
                "Arquitectura que captura la esencia del Mediterráneo",
            },
            {
              label: "Lujo sin Esfuerzo",
              image: "/assets/imagenes/view3.webp",
              description: "Lujo sin esfuerzo en cada detalle",
            },
            {
              label: "Acceso a Playa",
              image: "/assets/imagenes/beach.webp",
              description: "Acceso directo a playas de arena blanca",
            },
          ],
        },
        // FEATURES_4: Amenities Carousel
        amenities: {
          title: "Servicios",
          tagline: "Espacios diseñados para el bienestar",
          items: [
            {
              title: "Cine Exterior",
              image: "/assets/imagenes/cinema.webp",
              description:
                "Cine al aire libre con proyección bajo las estrellas",
            },
            {
              title: "Spa y Bienestar",
              image: "/assets/imagenes/foto galeria 7.webp",
              description: "Centro de bienestar con tratamientos de lujo",
            },
            {
              title: "Centro de Fitness",
              image: "/assets/imagenes/foto galeria 4.webp",
              description:
                "Gimnasio equipado con tecnología de última generación",
            },
            {
              title: "Piscinas Exteriores",
              image: "/assets/imagenes/nueva_piscina_mejorada.webp",
              description: "Piscinas infinity con vistas al Mediterráneo",
            },
            {
              title: "Comercios y Restauración",
              image: "/assets/imagenes/retail.webp",
              description: "Gastronomía y retail de primer nivel",
            },
          ],
        },
      },
      gallery: {
        title: "El Proyecto",
        subtitle: "Diseño arquitectónico excepcional en Azure Bay District",
        description:
          "Explore la elegancia y sofisticación de Azure Bay a través de renders de alta resolución y fotografías del entorno.",
      },
      apartments: {
        title: "Colección de Apartamentos",
        subtitle: "Espacios diseñados para cada perfil inversor",
        description:
          "Desde estudios boutique hasta áticos de tres dormitorios, cada tipología ofrece vistas al mar, entrega llave en mano y acceso al plan de pago del 1% mensual.",
        note: "Los precios son estimaciones orientativas basadas en el tipo de cambio vigente y pueden variar sin previo aviso.",
        tabs: {
          studio: {
            label: "Estudio",
            headline: "Estudios boutique frente al mar",
            description:
              "Distribución abierta con cocina integrada, ventanales de piso a techo y balcón privado hacia el Golfo.",
            highlights: [
              "Totalmente amueblados con domótica y electrodomésticos premium",
              "Baño hotelero con acabados de piedra natural",
              "Ideal para renta corporativa o pied-à-terre en Azure Coast",
            ],
            parking: "Opción de aparcacoches gratuito para residentes",
          },
          oneBed: {
            label: "1 Habitación",
            headline: "Suite residencial con sala independiente",
            description:
              "Salón comedor con cocina lineal, dormitorio en suite y balcón profundo para disfrutar del skyline.",
            highlights: [
              "Vestidor cerrado y baño principal con doble lavabo",
              "Zona de lavandería y almacenamiento oculto",
              "Elegible para paquete de gestión de rentas llave en mano",
            ],
            parking: "1 plaza de parking (aprox. 11.750€)",
          },
          twoBed: {
            label: "2 Habitaciones",
            headline: "Plantas angulares con vistas duales",
            description:
              "Dos dormitorios en suite, cocina con isla y sala envolvente que accede a dos balcones panorámicos.",
            highlights: [
              "Dormitorio principal tipo master con lounge privado",
              "Baño secundario con ventilación natural y tocador doble",
              "Espacio flexible para despacho o family room",
            ],
            parking: "1 plaza de parking incluida",
          },
          threeBed: {
            label: "3 Habitaciones",
            headline: "Residencias familiares con terraza envolvente",
            description:
              "Amplia zona social, cocina cerrada y tres suites con acceso directo a una terraza de más de 25 m².",
            highlights: [
              "Habitación principal con baño spa y walk-in closet de 6 metros",
              "Cuarto de servicio con baño independiente",
              "Vistas de 180° hacia el mar y el skyline de la Azure Grand Marina",
            ],
            parking: "2 plazas de parking incluidas",
          },
        },
      },
      trust: {
        title: "Caso de Estudio (Portfolio)",
        subtitle: "Landing premium + automatización de captación",
        description:
          "Proyecto ficticio creado por Anclora Cognitive Solutions (Anclora Nexus Group) para demostrar un servicio integral: diseño UI premium, copy bilingüe, estructura de conversión y automatización del lead magnet (dossier).",
        partners: "Cobertura (mock) para contexto narrativo",
        readMore: "Ver ejemplo",
        articles: [
          {
            date: "Mayo 2026",
            image: "/assets/imagenes/news_1.webp",
            alt: "Coastal Development Review - Azure Grand Marina",
            source: "Coastal Development Review",
            title: "Azure Grand Marina: el nuevo polo del waterfront",
            summary:
              "Anuncio de la marina, boulevard comercial y oferta gastronómica como catalizador del distrito costero.",
            url: "https://example.com",
          },
          {
            date: "Abril 2026",
            image: "/assets/imagenes/news_2.webp",
            alt: "Global Wealth Digest - Coastal migration",
            source: "Global Wealth Digest",
            title: "La nueva ola de inversión en distritos costeros emergentes",
            summary:
              "Tendencias de movilidad de capital hacia zonas premium frente al mar con infraestructuras planificadas.",
            url: "https://example.com",
          },
          {
            date: "Febrero 2026",
            image: "/assets/imagenes/news_3.webp",
            alt: "Marina & Hospitality Report - Signature Boulevard",
            source: "Marina & Hospitality Report",
            title: "Signature Boulevard: retail y hospitality en primera línea",
            summary:
              "Cómo el mix de retail, hotelería y ocio eleva la demanda residencial y la ocupación turística.",
            url: "https://example.com",
          },
          {
            date: "Enero 2026",
            image: "/assets/imagenes/news_4.webp",
            alt: "Coastal Economics - Infrastructure impact",
            source: "Coastal Economics",
            title: "Infraestructura y apreciación: el ciclo del waterfront",
            summary:
              "Guía de lectura para inversores: fases de apreciación antes y después de un gran hito urbano.",
            url: "https://example.com",
          },
          {
            date: "Noviembre 2025",
            image: "/assets/imagenes/news_5.webp",
            alt: "Residential Market Insights - Supply & demand",
            source: "Residential Market Insights",
            title:
              "Oferta vs demanda: por qué suben los alquileres en zonas prime",
            summary:
              "Factores que explican el incremento de alquileres en productos turnkey frente al mar (análisis ilustrativo).",
            url: "https://example.com",
          },
        ],
      },
      specifications: {
        title: "Especificaciones",
        subtitle: "Unidades diseñadas para el inversor sofisticado",
        description:
          "Desde estudios compactos hasta amplios apartamentos de 3 dormitorios, todas las unidades incluyen acabados premium, domótica y entrega totalmente amueblada.",
        units: [
          {
            type: "Studio",
            size: "37-45 m²",
            price: "Desde 170.000€",
            features: [
              "Smart Home",
              "Totalmente amueblado",
              "Balcón privado",
              "Cocina equipada",
            ],
          },
          {
            type: "1 Dormitorio",
            size: "65-75 m²",
            price: "Desde 240.000€",
            features: [
              "Smart Home",
              "Totalmente amueblado",
              "Balcón amplio",
              "Dormitorio principal en-suite",
            ],
          },
          {
            type: "2 Dormitorios",
            size: "95-110 m²",
            price: "Desde 350.000€",
            features: [
              "Smart Home",
              "Totalmente amueblado",
              "2 Balcones",
              "Dormitorios en-suite",
            ],
          },
          {
            type: "3 Dormitorios",
            size: "135-160 m²",
            price: "Desde 480.000€",
            features: [
              "Smart Home",
              "Totalmente amueblado",
              "Terraza amplia",
              "3 Baños completos",
            ],
          },
        ],
      },
      paymentPlan: {
        title: "Plan de Pago",
        subtitle: "Inversión flexible con términos competitivos",
        description:
          "40% durante construcción antes de entrega. Balance 60% a 1% mensual durante 60 meses post-entrega.",
        mainPayment: "40%",
        mainLabel: "Al Comprar",
        postHandover: "60%",
        postLabel: "Post-Entrega",
        postDetails: "1% mensual durante 60 meses",
        features: [
          "Esquema flexible para inversores internacionales",
          "Maximiza tu liquidez durante el periodo de construcción",
        ],
        cards: [
          {
            text: "Accede a la propiedad sin complicaciones: tu inversión se ajusta a ti.",
          },
          {
            text: "Empieza a vivir tu sueño ahora y paga cómodamente a lo largo del tiempo.",
          },
        ],
      },
      investment: {
        title: "Oportunidad de Inversión",
        subtitle: "Rentabilidad impulsada por el Efecto Marina",
        description:
          "Azure Bay es un caso de estudio (proyecto ficticio) diseñado para ilustrar cómo se presenta un activo premium en un distrito costero emergente. Con un plan flexible del 1% mensual y entrega en Q3 2026, el posicionamiento se produce antes de la apertura de la Azure Grand Marina en primavera de 2027.",
        stats: [
          {
            icon: TrendingUp,
            value: "6–8%",
            label: "Rentabilidad bruta objetivo",
            description: "Proyección ilustrativa (según escenarios)",
          },
          {
            icon: TrendingUp,
            value: "+32%",
            label: "Impulso de demanda",
            description: "Hasta el hito de primavera 2027",
          },
          {
            icon: Award,
            value: "Q3 2026",
            label: "Entrega del proyecto",
            description: "Antes del catalizador 2027",
          },
          {
            icon: DollarSign,
            value: "1%",
            label: "Pago mensual",
            description: "Durante 60 meses post‑entrega",
          },
        ],
        benefits: [
          "Catalizador de demanda: Azure Grand Marina (primavera 2027)",
          "Unidades amuebladas + domótica (ejemplo de especificación)",
          "Potencial de apreciación por consolidación del distrito costero",
          "Estrategias de salida y sensibilidad de escenarios en el dossier",
        ],
      },
      leadForm: {
        title: "Dossier de Inversión (Demo)",
        subtitle: "Escenarios financieros + proyecciones del Efecto Marina",
        badge: "Portfolio Demo",
        intro: "Escenarios ilustrativos y proyecciones del Efecto Marina",
        description:
          "Acceda a un dossier de ejemplo con proyecciones de rentabilidad, planos, tipologías y el impacto del catalizador urbano (Azure Grand Marina) sobre Azure Bay District. Caso de estudio creado por Anclora Cognitive Solutions (Anclora Nexus Group).",
        features: [
          "Escenarios 2026–2032 y estrategias de salida",
          "Simulación de cashflow con plan 1% mensual",
          "Tipologías, planos y memorias de calidades (demo)",
          "Calendario de hitos y automatización de seguimiento",
        ],
        form: {
          firstNamePlaceholder: "Nombre",
          lastNamePlaceholder: "Apellidos",
          emailPlaceholder: "Email",
          ctaButton: "Descargar Dossier (Demo)",
          sending: "Preparando tu dossier...",
          privacy:
            "Usamos tus datos solo para personalizar el dossier demo y disparar la automatización descrita.",
          successMessage:
            "Gracias, {{name}}. Tu dossier demo se está enviando a tu bandeja.",
          errorMessage:
            "No pudimos completar el envío. Inténtalo de nuevo o contáctanos.",
        },
      },
      location: {
        title: "Azure Bay District",
        subtitle: "Un waterfront emergente con visión 2030",
        description:
          "Distrito costero planificado para combinar vida residencial premium, paseo marítimo, marina y retail. Ubicación omitida intencionalmente (caso de estudio/portfolio).",
        stats: [
          {
            number: "9",
            label: "Km de paseo marítimo",
            labelEn: "Km of seafront promenade",
          },
          {
            number: "2.3",
            label: "Millones m² masterplan",
            labelEn: "Million m² masterplan",
          },
          {
            number: "3",
            label: "Zonas de marina + retail",
            labelEn: "Marina + retail zones",
          },
          {
            number: "25",
            label: "Min al aeropuerto (demo)",
            labelEn: "Min to airport (demo)",
          },
        ],
      },
      faq: {
        eyebrow: "Preguntas estratégicas",
        title: "Preguntas Frecuentes",
        subtitle:
          "Respuestas orientativas para un caso de estudio (portfolio).",
        highlights: [
          "Proyecto ficticio usado como ejemplo de servicio",
          "Copy bilingüe + estructura de conversión",
          "Automatización del lead magnet incluida en el flujo",
        ],
        cta: "Hablar con un especialista",
        questions: [
          {
            question: "¿Qué es Azure Bay?",
            answer:
              "Azure Bay es un complejo residencial ficticio creado como caso de estudio para mostrar cómo diseñamos una landing premium y una narrativa de inversión alrededor de un distrito costero emergente.",
          },
          {
            question: "¿Qué tipologías de apartamentos hay disponibles?",
            answer:
              "Estudios y unidades de 1, 2 y 3 dormitorios (ejemplo). El objetivo es ilustrar cómo se presenta cada tipología con beneficios claros, highlights y un encaje para distintos perfiles de inversor.",
          },
          {
            question: "¿Qué amenidades ofrece Azure Bay?",
            answer:
              "Amenidades tipo resort (ejemplo): spa, piscinas interior/exterior, rooftop lounge, gimnasio, kids club, playa privada y servicios de concierge 24/7. El listado es configurable según el producto real.",
          },
          {
            question: "¿Cuándo se entregará Azure Bay?",
            answer:
              "La entrega ilustrativa está fijada en Q3 2026, para posicionar al inversor antes del hito urbano principal: la apertura de Azure Grand Marina en primavera de 2027.",
          },
          {
            question: "¿Es una buena oportunidad de inversión?",
            answer:
              "En este caso de estudio, el argumento de inversión se apoya en un catalizador urbano (marina + boulevard) que incrementa demanda y puede impulsar rentas y apreciación. El dossier demo incluye escenarios y sensibilidad.",
          },
          {
            question: "¿Quién es el desarrollador?",
            answer:
              "Azure Bay Development Group (ficticio). El objetivo es demostrar el servicio de Anclora Cognitive Solutions: diseño, copy, estructura de conversión y automatización de captación.",
          },
          {
            question: "¿Cómo funciona el plan de pagos?",
            answer:
              "Ejemplo: 40% durante construcción antes de la entrega, y 60% post‑entrega con pagos del 1% mensual durante 60 meses. El plan se adapta a condiciones reales de cada promotor.",
          },
          {
            question: "¿Dónde está ubicado?",
            answer:
              "Ubicación omitida intencionalmente (portfolio). Se presenta como un distrito costero emergente en primera línea de playa, con un gran catalizador (Azure Grand Marina) previsto para 2027.",
          },
          {
            question: "¿Cuáles son las cuotas de servicio?",
            answer:
              "En un caso real dependen de amenidades y operación. En el dossier demo se incluiría una estimación y el detalle de qué cubren (mantenimiento, seguridad, zonas comunes, etc.).",
          },
        ],
      },
    },
    en: {
      hero: {
        title: "Azure Bay",
        subtitle: "AZURE BAY • EMERGING COASTAL DISTRICT",
        description:
          "Portfolio case study: a fictional beachfront residential concept accelerated by the upcoming Azure Grand Marina (Spring 2027). Indicative projections.",
        price: "Starting from £165,000",
        payment: "Pay Just 1% Per Month for 5 Years",
        handover: "Handover Q3 2026",
        cta1: "Download Dossier",
        cta2: "Book Now",
      },
      menu: {
        wynnEffect: "The Marina Effect",
        investment: "Investment",
        features: "Features",
        gallery: "Gallery",
        apartments: "Apartments",
        location: "Location",
        faq: "FAQ",
      },
      wynnEffect: {
        title: "The Marina Effect",
        subtitle: "The catalyst reshaping Azure Bay District",
        description:
          "The upcoming Azure Grand Marina & Signature Boulevard (opening Spring 2027) is attracting capital, tourism, and new residential demand. Investors position ahead of the milestone to capture the full waterfront appreciation cycle.",
        stats: [
          {
            icon: TrendingUp,
            value: "+32%",
            label: "Demand uplift",
            sublabel: "Indicative 2025–2027",
          },
          {
            icon: DollarSign,
            value: "€3.4B",
            label: "District investment",
            sublabel: "Marina + boulevard + retail",
          },
          {
            icon: Calendar,
            value: "Spring 2027",
            label: "Marina opening",
            sublabel: "Consolidation trigger",
          },
        ],
        urgency: {
          title: "Why position NOW?",
          description:
            "Sophisticated investors move early, ahead of the marina launch and commercial promenade activation. Azure Bay delivers in Q3 2026, aligning you with the pre‑ and post‑launch window.",
          countdown: "Delivery: Q3 2026 • Marina opening: Spring 2027",
        },
      },
      features: {
        // FEATURES_1: Development Structure
        development: {
          title: "Development Structure",
          tagline: "Contemporary architecture facing the sea",
          description: [
            "Three iconic towers combining timeless elegance with the coastal setting of Azure Bay District.",
            "Architectural design that maximizes panoramic views of the open sea from every residence.",
          ],
          image: "/assets/imagenes/collage_estructura.webp",
        },
        // FEATURES_2: Specifications
        specifications: {
          title: "Specifications",
          tagline: "Details that define excellence",
          cards: [
            {
              title: "Studios",
              size: "300-462 SqFt",
              price: "From £146,200",
              features: "Integrated kitchen, premium bathroom, private balcony",
            },
            {
              title: "1 Bedroom",
              size: "600-850 SqFt",
              price: "From £245,100",
              features: "En-suite bedroom, walk-in closet, laundry area",
            },
            {
              title: "2 Bedrooms",
              size: "1100-1200 SqFt",
              price: "From £387,000",
              features: "Two suites, island kitchen, dual balconies",
            },
            {
              title: "3 Bedrooms",
              size: "1700-1800 SqFt",
              price: "From £559,000",
              features: "Master suite, maid's room, 25m² terrace",
            },
          ],
        },
        // FEATURES_3: Azure Bay Views
        playaViva: {
          title: "Azure Bay",
          tagline: "Four perspectives of beachfront living",
          tabs: [
            {
              label: "Coastal Community",
              image: "/assets/imagenes/view1.webp",
              description: "Exclusive beachfront community",
            },
            {
              label: "Inspired Design",
              image: "/assets/imagenes/view2.webp",
              description: "Architecture capturing Mediterranean essence",
            },
            {
              label: "Effortless Luxury",
              image: "/assets/imagenes/view3.webp",
              description: "Effortless luxury in every detail",
            },
            {
              label: "Beach Access",
              image: "/assets/imagenes/beach.webp",
              description: "Direct access to white sandy beaches",
            },
          ],
        },
        // FEATURES_4: Amenities Carousel
        amenities: {
          title: "Amenities",
          tagline: "Spaces designed for wellbeing",
          items: [
            {
              title: "Outdoor Cinema",
              image: "/assets/imagenes/cinema.webp",
              description: "Open-air cinema with screenings under the stars",
            },
            {
              title: "Spa & Wellness",
              image: "/assets/imagenes/foto galeria 7.webp",
              description: "Wellness center with luxury treatments",
            },
            {
              title: "Fitness Center",
              image: "/assets/imagenes/foto galeria 4.webp",
              description: "Gym equipped with state-of-the-art technology",
            },
            {
              title: "Outdoor Swimming Pools",
              image: "/assets/imagenes/nueva_piscina_mejorada.webp",
              description: "Infinity pools overlooking the Mediterranean",
            },
            {
              title: "Retail & Dining",
              image: "/assets/imagenes/retail.webp",
              description: "World-class dining and retail",
            },
          ],
        },
      },
      gallery: {
        title: "The Project",
        subtitle: "Exceptional architectural design in Azure Bay District",
        description:
          "Explore the elegance and sophistication of Azure Bay through high-resolution renders and environmental photography.",
      },
      apartments: {
        title: "Apartment Collection",
        subtitle: "Layouts tailored to every investment profile",
        description:
          "From boutique studios to three-bedroom residences, each typology delivers sea views, turnkey interiors, and access to the 1% monthly payment plan.",
        note: "Prices are indicative estimates based on prevailing FX and may adjust at the time of reservation.",
        tabs: {
          studio: {
            label: "Studio",
            headline: "Boutique studios facing the sea",
            description:
              "Open-plan living with integrated kitchen, floor-to-ceiling glazing, and a private balcony overlooking the Gulf.",
            highlights: [
              "Fully furnished with smart-home package and premium appliances",
              "Hotel-inspired bathroom wrapped in natural stone",
              "Perfect for corporate leasing or a pied-à-terre in Azure Coast",
            ],
            parking: "Complimentary valet option for residents",
          },
          oneBed: {
            label: "1 Bedroom",
            headline: "One-bedroom suite with defined living zones",
            description:
              "Separate living/dining area, en-suite bedroom, and a deep balcony to capture the skyline.",
            highlights: [
              "Walk-in wardrobe plus primary bathroom with double vanity",
              "Dedicated laundry and concealed storage",
              "Eligible for turnkey rental management",
            ],
            parking: "1 parking space (approx. £10,380)",
          },
          twoBed: {
            label: "2 Bedrooms",
            headline: "Corner layouts with dual-aspect views",
            description:
              "Two en-suite bedrooms, island kitchen, and wraparound living room opening onto twin panoramic balconies.",
            highlights: [
              "Primary suite with private lounge corner",
              "Secondary bath with natural ventilation and twin vanity",
              "Flexible den for office or family room use",
            ],
            parking: "1 parking space included",
          },
          threeBed: {
            label: "3 Bedrooms",
            headline: "Family residences with sweeping terrace",
            description:
              "Expansive great room, closed kitchen, and three suites that spill onto a 25 m² terrace.",
            highlights: [
              "Owner's suite with spa bathroom and 6-metre walk-in wardrobe",
              "Maid's room with dedicated bathroom",
              "180° views across the sea and the Azure Grand Marina skyline",
            ],
            parking: "2 parking spaces included",
          },
        },
      },
      trust: {
        title: "Case Study (Portfolio)",
        subtitle: "Premium landing + lead automation",
        description:
          "Fictional project created by Anclora Cognitive Solutions (Anclora Nexus Group) to showcase an end‑to‑end service: premium UI, bilingual copy, conversion structure and lead‑magnet automation (dossier).",
        partners: "Mock coverage for narrative context",
        readMore: "View example",
        articles: [
          {
            date: "May 2026",
            image: "/assets/imagenes/news_1.webp",
            alt: "Coastal Development Review - Azure Grand Marina",
            source: "Coastal Development Review",
            title: "Azure Grand Marina: the next waterfront hub",
            summary:
              "Announcement of the marina, commercial boulevard and dining scene as the district catalyst.",
            url: "https://example.com",
          },
          {
            date: "April 2026",
            image: "/assets/imagenes/news_2.webp",
            alt: "Global Wealth Digest - Coastal migration",
            source: "Global Wealth Digest",
            title: "Capital shifts towards emerging coastal districts",
            summary:
              "Investor patterns favouring prime beachfront zones with planned infrastructure and hospitality.",
            url: "https://example.com",
          },
          {
            date: "February 2026",
            image: "/assets/imagenes/news_3.webp",
            alt: "Marina & Hospitality Report - Signature Boulevard",
            source: "Marina & Hospitality Report",
            title: "Signature Boulevard: retail & hospitality on the seafront",
            summary:
              "How curated retail and leisure programmes boost residential demand and tourist occupancy.",
            url: "https://example.com",
          },
          {
            date: "January 2026",
            image: "/assets/imagenes/news_4.webp",
            alt: "Coastal Economics - Infrastructure impact",
            source: "Coastal Economics",
            title: "Infrastructure and appreciation: the waterfront cycle",
            summary:
              "Investor lens: the pre‑ and post‑milestone appreciation phases around major urban catalysts.",
            url: "https://example.com",
          },
          {
            date: "November 2025",
            image: "/assets/imagenes/news_5.webp",
            alt: "Residential Market Insights - Supply & demand",
            source: "Residential Market Insights",
            title: "Supply vs demand: why rents rise in prime turnkey products",
            summary:
              "Illustrative analysis of rental pressure drivers for furnished beachfront residences.",
            url: "https://example.com",
          },
        ],
      },
      specifications: {
        title: "Specifications",
        subtitle: "Units designed for the sophisticated investor",
        description:
          "From compact studios to spacious 3-bedroom apartments, all units include premium finishes, home automation and fully furnished delivery.",
        units: [
          {
            type: "Studio",
            size: "37-45 m²",
            price: "From £150,000",
            features: [
              "Smart Home",
              "Fully furnished",
              "Private balcony",
              "Equipped kitchen",
            ],
          },
          {
            type: "1 Bedroom",
            size: "65-75 m²",
            price: "From £210,000",
            features: [
              "Smart Home",
              "Fully furnished",
              "Spacious balcony",
              "Master bedroom en-suite",
            ],
          },
          {
            type: "2 Bedrooms",
            size: "95-110 m²",
            price: "From £310,000",
            features: [
              "Smart Home",
              "Fully furnished",
              "2 Balconies",
              "En-suite bedrooms",
            ],
          },
          {
            type: "3 Bedrooms",
            size: "135-160 m²",
            price: "From £420,000",
            features: [
              "Smart Home",
              "Fully furnished",
              "Large terrace",
              "3 Full bathrooms",
            ],
          },
        ],
      },
      paymentPlan: {
        title: "Payment Plan",
        subtitle: "Flexible investment with competitive terms",
        description:
          "40% during construction before handover. Balance 60% at 1% per month for 60 months post-handover.",
        mainPayment: "40%",
        mainLabel: "On Purchase",
        postHandover: "60%",
        postLabel: "Post-Handover",
        postDetails: "1% per month for 60 months",
        features: [
          "Flexible scheme for international investors",
          "Maximize your liquidity during construction period",
        ],
        cards: [
          {
            text: "Unlock the door to effortless ownership—your investment adapts to you.",
          },
          {
            text: "Start living your dream today, pay comfortably over time.",
          },
        ],
      },
      investment: {
        title: "Investment Opportunity",
        subtitle: "Returns accelerated by the Marina Effect",
        description:
          "Azure Bay is a portfolio case study (fictional project) designed to showcase how a premium waterfront asset is positioned within an emerging coastal district. With a flexible 1% monthly plan and Q3 2026 handover, the timing aligns ahead of the Azure Grand Marina opening in Spring 2027.",
        stats: [
          {
            icon: TrendingUp,
            value: "6–8%",
            label: "Target gross yield",
            description: "Illustrative projection (scenario‑based)",
          },
          {
            icon: TrendingUp,
            value: "+32%",
            label: "Demand uplift",
            description: "Into the Spring 2027 milestone",
          },
          {
            icon: Award,
            value: "Q3 2026",
            label: "Project handover",
            description: "Ahead of the 2027 catalyst",
          },
          {
            icon: DollarSign,
            value: "1%",
            label: "Monthly payment",
            description: "For 60 months post‑handover",
          },
        ],
        benefits: [
          "Demand catalyst: Azure Grand Marina (Spring 2027)",
          "Turnkey furnishing + smart home (sample spec)",
          "Appreciation potential as the district consolidates",
          "Exit strategies and scenario sensitivity in the dossier",
        ],
      },
      leadForm: {
        title: "Investment Dossier (Demo)",
        subtitle: "Financial scenarios + Marina Effect projections",
        badge: "Portfolio Demo",
        intro: "Illustrative scenarios and Marina Effect projections",
        description:
          "Access a sample dossier with return scenarios, layouts, specs and the projected impact of the urban catalyst (Azure Grand Marina) on Azure Bay District. Portfolio case study built by Anclora Cognitive Solutions (Anclora Nexus Group).",
        features: [
          "2026–2032 scenarios and exit strategies",
          "Cash‑flow simulation with the 1% monthly plan",
          "Masterplan, typologies and delivered specs (demo)",
          "Milestone calendar + follow‑up automation",
        ],
        form: {
          firstNamePlaceholder: "First name",
          lastNamePlaceholder: "Last name",
          emailPlaceholder: "Email",
          ctaButton: "Download Dossier (Demo)",
          sending: "Preparing your dossier...",
          privacy:
            "We only use your details to personalise the demo dossier and trigger the described automation.",
          successMessage:
            "Thank you, {{name}}. Your demo dossier is on its way to your inbox.",
          errorMessage:
            "We couldn't finalise the send. Please try again or contact our team.",
        },
      },
      location: {
        title: "Azure Bay District",
        subtitle: "An emerging waterfront vision for 2030",
        description:
          "A masterplanned coastal district combining premium residential living, a seafront promenade, marina infrastructure and curated retail. Location intentionally omitted (portfolio case study).",
        stats: [
          {
            number: "9",
            label: "Km de paseo marítimo",
            labelEn: "Km of seafront promenade",
          },
          {
            number: "2.3",
            label: "Millones m² masterplan",
            labelEn: "Million m² masterplan",
          },
          {
            number: "3",
            label: "Zonas de marina + retail",
            labelEn: "Marina + retail zones",
          },
          {
            number: "25",
            label: "Min al aeropuerto (demo)",
            labelEn: "Min to airport (demo)",
          },
        ],
      },
      faq: {
        eyebrow: "Strategic Questions",
        title: "Frequently Asked Questions",
        subtitle: "Indicative answers for a portfolio case study.",
        highlights: [
          "Fictional project used as a service example",
          "Bilingual copy + conversion structure",
          "Lead‑magnet automation included in the flow",
        ],
        cta: "Speak to a specialist",
        questions: [
          {
            question: "What is Azure Bay?",
            answer:
              "Azure Bay is a fictional residential concept built as a portfolio case study to showcase a premium landing page and an investment narrative around an emerging coastal district.",
          },
          {
            question: "What types of apartments are available?",
            answer:
              "Studios and 1, 2 and 3‑bed layouts (illustrative). The goal is to demonstrate how each typology is positioned with clear benefits, highlights and fit for different investor profiles.",
          },
          {
            question: "What amenities does Azure Bay offer?",
            answer:
              "Resort‑style amenities (illustrative): spa, indoor/outdoor pools, rooftop lounge, gym, kids club, private beach and 24/7 concierge. The list is configurable per real product.",
          },
          {
            question: "When will Azure Bay be completed?",
            answer:
              "Illustrative delivery is set to Q3 2026, positioning investors ahead of the key urban milestone: the Azure Grand Marina opening in Spring 2027.",
          },
          {
            question: "Is Azure Bay a good investment opportunity?",
            answer:
              "In this case study, the investment argument is driven by an urban catalyst (marina + boulevard) that can lift demand, rents and capital appreciation. The demo dossier includes scenarios and sensitivity.",
          },
          {
            question: "Who is the developer of Azure Bay?",
            answer:
              "Azure Bay Development Group (fictional). The objective is to showcase Anclora Cognitive Solutions’ service: design, copy, conversion structure and lead automation.",
          },
          {
            question: "What are the payment terms?",
            answer:
              "Example: 40% during construction before handover, and 60% post‑handover via 1% monthly payments across 60 months. The structure is adapted to each developer’s real terms.",
          },
          {
            question: "Where is Azure Bay located?",
            answer:
              "Location is intentionally omitted (portfolio). It is presented as a beachfront district in expansion, supported by a major catalyst (Azure Grand Marina) planned for 2027.",
          },
          {
            question: "What are the service fees at Azure Bay?",
            answer:
              "In real projects they depend on amenities and operations. In the demo dossier we would include an estimate and a clear breakdown of what the fees cover.",
          },
        ],
      },
    },
  };

  const t = content[language];
  const priceString = language === "es" ? "192.000€" : "£172,000";
  const pricePrefix = language === "es" ? "Desde" : "Starting from";
  const mobileMenuLabels =
    language === "es"
      ? { open: "Abrir menú de navegación", close: "Cerrar menú de navegación" }
      : { open: "Open navigation menu", close: "Close navigation menu" };
  const languageToggleAriaLabel =
    language === "es"
      ? "ES | EN — Cambia el idioma a inglés"
      : "ES | EN — Switch language to Spanish";

  const apartmentConfigs = {
    studio: {
      image: "/assets/imagenes/studio-1.webp",
      sizeSqftRange: [300, 462] as [number, number],
      bedrooms: 0,
      bathrooms: 1,
    },
    oneBed: {
      image: "/assets/imagenes/1-bedroom-1.webp",
      sizeSqftRange: [600, 850] as [number, number],
      bedrooms: 1,
      bathrooms: 1,
    },
    twoBed: {
      image: "/assets/imagenes/2-bedroom-1.webp",
      sizeSqftRange: [1100, 1200] as [number, number],
      bedrooms: 2,
      bathrooms: 1,
    },
    threeBed: {
      image: "/assets/imagenes/3-bedroom-1.webp",
      sizeSqftRange: [1700, 1800] as [number, number],
      bedrooms: 3,
      bathrooms: 2,
    },
  };

  const apartmentPrices = {
    studio: { en: "£172,000", es: "192.000€" },
    oneBed: { en: "£325,000", es: "370.000€" },
    twoBed: { en: "£526,000", es: "598.000€" },
    threeBed: { en: "£795,000", es: "905.000€" },
  } as const;

  const formatSizeRange = (range: [number, number]) => {
    if (language === "es") {
      const sqm = range.map((value) => Math.round(value / 10.7639));
      return `${sqm[0]}-${sqm[1]} m²`;
    }
    return `${range[0]}-${range[1]} sq ft`;
  };

  const formatBedroomValue = (count: number) => {
    if (count === 0) {
      return language === "es" ? "Estudio" : "Studio";
    }
    const plural = count > 1;
    return language === "es"
      ? `${count} ${plural ? "habitaciones" : "habitación"}`
      : `${count} ${plural ? "bedrooms" : "bedroom"}`;
  };

  const formatBathroomValue = (count: number) => {
    const valueString =
      language === "es" ? count.toString().replace(".", ",") : count.toString();
    const plural = count > 1;
    return language === "es"
      ? `${valueString} ${plural ? "baños" : "baño"}`
      : `${valueString} ${plural ? "baths" : "bath"}`;
  };

  const infoLabels = {
    size: language === "es" ? "Superficie" : "Interior size",
    price: language === "es" ? "Desde" : "From",
    bedrooms: language === "es" ? "Dormitorios" : "Bedrooms",
    bathrooms: language === "es" ? "Baños" : "Bathrooms",
    parking: "Parking",
  };

  const statCardBaseClasses =
    "rounded-2xl border border-gold-warm/30 p-4 shadow-sm bg-linear-to-br from-[#fdf9f3] via-[#f7ede1] to-[#f1e2d3] text-brown-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:brightness-95";

  const apartmentCopy = t.apartments.tabs[activeApartment];
  const activeApartmentConfig = apartmentConfigs[activeApartment];
  const activeApartmentPrice = apartmentPrices[activeApartment][language];
  const highlightItems = [...apartmentCopy.highlights, t.apartments.note];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: "Azure Bay",
    description:
      language === "es"
        ? "Residencias frente al mar en Al Marjan Island con entrega llave en mano y plan 1% mensual."
        : "Seafront residences in Al Marjan Island with turnkey delivery and a 1% monthly plan.",
    url: SITE_URL,
    image: `${SITE_URL}/assets/imagenes/hero-image.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Marjan Island",
      addressLocality: "Ras Al Khaimah",
      addressCountry: "AE",
    },
    offers: [
      {
        "@type": "AggregateOffer",
        priceCurrency: "GBP",
        lowPrice: "172000",
        highPrice: "795000",
        offerCount: 4,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: "192000",
        highPrice: "905000",
        offerCount: 4,
        availability: "https://schema.org/InStock",
      },
    ],
    seller: {
      "@type": "Organization",
      name: "Anclora Private Estates",
      url: "https://www.ancloraprivateestates.com",
    },
  };
  const featureColumns = [
    t.leadForm.features.slice(0, 2),
    t.leadForm.features.slice(2),
  ];
  const LuxuryBadge = ({
    label,
    alignment = "center",
  }: {
    label: string;
    alignment?: "start" | "center";
  }) => (
    <div
      className={`inline-flex w-full ${
        alignment === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <div className="relative px-10 py-3.5 rounded-full border-2 border-[#A29060] bg-linear-to-br from-[#f5f1ea]/95 via-white/90 to-[#ede8df]/95 text-[#A29060] font-bold tracking-[0.35em] shadow-[0_8px_32px_rgba(162,144,96,0.3),0_0_0_1px_rgba(162,144,96,0.2)_inset,0_1px_2px_rgba(255,255,255,0.8)_inset] backdrop-blur-md overflow-hidden group transition-all duration-500 hover:shadow-[0_16px_48px_rgba(162,144,96,0.6),0_0_60px_rgba(162,144,96,0.3),0_0_0_2px_rgba(162,144,96,0.5)_inset,0_2px_4px_rgba(255,255,255,1)_inset] hover:scale-105 hover:border-[#d4b876] cursor-pointer">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#A29060]/60 to-transparent group-hover:via-[#d4b876] transition-all duration-500"></div>
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>
        <div className="absolute inset-0 bg-linear-to-br from-[#A29060]/0 via-[#A29060]/0 to-[#A29060]/0 group-hover:from-[#A29060]/10 group-hover:via-white/20 group-hover:to-[#d4b876]/10 transition-all duration-500"></div>
        <div
          className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #A29060 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        ></div>
        <span className="relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(162,144,96,0.4)] transition-all duration-500 uppercase tracking-[0.35em] text-xs md:text-sm">
          {label}
        </span>
      </div>
    </div>
  );
  const nameLabel = language === "es" ? "Nombre completo" : "Full name";
  const emailLabel = "Email";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setShowMenu(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const showBackToHero = scrollProgress >= 1;

  const orchestrateLeadAutomation = async (
    payload: LeadAutomationPayload
  ): Promise<LeadAutomationResult> => {
    const getHubSpotCookie = () => {
      if (typeof document === "undefined") return "";
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "hubspotutk") {
          return value;
        }
      }
      return "";
    };

    const hubspotutk = getHubSpotCookie() || `generated_${Date.now()}`;
    const pageUri =
      typeof window !== "undefined" ? window.location.href : SITE_URL;

    const response = await fetch("/api/submit-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: payload.fullName,
        email: payload.email,
        language: payload.language,
        hubspotutk,
        pageUri,
        utm: payload.utm,
        altchaPayload: payload.altchaPayload,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Error procesando lead";
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
      } catch {
        // swallow
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };

  const fieldErrorCopy: Record<LeadFieldKey, string> = {
    firstName:
      language === "es"
        ? "Indica tu nombre para personalizar el dossier."
        : "Please include your first name so we can personalize the dossier.",
    lastName:
      language === "es"
        ? "Añade tus apellidos para continuar."
        : "Please add your last name to continue.",
    email:
      language === "es"
        ? "Necesitamos tu email para enviarte el dossier."
        : "We need your email address to deliver the dossier.",
    privacy:
      language === "es"
        ? "Debes aceptar la política de privacidad para recibir el dossier."
        : "You must accept the privacy policy before receiving the dossier.",
    captcha:
      language === "es"
        ? "Completa la verificación de seguridad para continuar."
        : "Please complete the security verification to continue.",
  };

  const emailInvalidCopy =
    language === "es"
      ? "Introduce un correo electrónico válido."
      : "Please enter a valid email address.";
  const altchaErrorCopy =
    language === "es"
      ? "Completa la verificación de seguridad antes de solicitar el dossier."
      : "Please complete the security verification before requesting the dossier.";

  const altchaTitle =
    language === "es"
      ? "Protección ALTCHA sin fricción"
      : "ALTCHA frictionless protection";
  const altchaCopy =
    language === "es"
      ? "ALTCHA verifica silenciosamente en tu dispositivo sin rastrear ni mostrar badges ajenos. Mantiene fuera a los bots sin romper la experiencia de lujo."
      : "ALTCHA verifies silently on-device with zero tracking or foreign badges, blocking bots without breaking the luxury experience.";
  const altchaStrings =
    language === "es"
      ? '{"label":"Verificando...","verified":"✓ Verificado","failed":"Vuelve a intentarlo"}'
      : '{"label":"Verifying...","verified":"✓ Verified","failed":"Please try again"}';
  const consentTitle =
    language === "es" ? "Privacidad de datos" : "Data privacy";
  const consentCopy =
    language === "es"
      ? "Añade un campo de privacidad de datos cuando necesites el consentimiento explícito de tus contactos. Refuerza la confianza y mantiene la trazabilidad legal."
      : "Add a dedicated data-privacy field whenever you need your contacts' consent. It reinforces trust and keeps compliance effortless.";
  const privacyCheckboxLabel =
    language === "es"
      ? "Acepto la política de privacidad y autorizo el uso de mis datos para recibir el dossier personalizado."
      : "I accept the privacy policy and authorise the use of my data to receive the personalised dossier.";

  const focusField = (
    ref: { current: HTMLElement | null },
    field: LeadFieldKey,
    message: string
  ) => {
    setValidationMessage({ field, message });
    requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (ref.current instanceof HTMLElement) {
        ref.current.focus();
      }
    });
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmData: Record<string, string> = {
      utm_source: urlParams.get("utm_source") || "",
      utm_medium: urlParams.get("utm_medium") || "",
      utm_campaign: urlParams.get("utm_campaign") || "",
      utm_term: urlParams.get("utm_term") || "",
      utm_content: urlParams.get("utm_content") || "",
    };

    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();
    const fallbackName = language === "es" ? "inversor" : "investor";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedFirstName) {
      focusField(firstNameRef, "firstName", fieldErrorCopy.firstName);
      return;
    }

    if (!trimmedLastName) {
      focusField(lastNameRef, "lastName", fieldErrorCopy.lastName);
      return;
    }

    if (!trimmedEmail) {
      focusField(emailRef, "email", fieldErrorCopy.email);
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      focusField(emailRef, "email", emailInvalidCopy);
      return;
    }

    const formElement = event.currentTarget;
    const formEntries = new FormData(formElement);
    const altchaPayload = formEntries.get("altcha_payload")?.toString() ?? "";

    if (!altchaPayload) {
      focusField(altchaRef, "captcha", altchaErrorCopy);
      return;
    }

    if (!privacyAccepted) {
      focusField(privacyRef, "privacy", fieldErrorCopy.privacy);
      return;
    }

    setIsSubmitting(true);
    setAutomationFeedback(null);
    setValidationMessage(null);

    try {
      const leadData: LeadAutomationPayload = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName: `${trimmedFirstName} ${trimmedLastName}`.trim(),
        email: trimmedEmail,
        language,
        utm: utmData,
        altchaPayload,
      };

      const result = await orchestrateLeadAutomation(leadData);

      if (result?.pdf_url) {
        const absoluteUrl = result.pdf_url.startsWith("http")
          ? result.pdf_url
          : `${window.location.origin}${result.pdf_url}`;
        const link = document.createElement("a");
        link.href = absoluteUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setAutomationFeedback({
        type: "success",
        userName: trimmedFirstName || fallbackName,
      });
      setFormData({ firstName: "", lastName: "", email: "" });
      setPrivacyAccepted(false);

      setTimeout(() => {
        setAutomationFeedback(null);
      }, 5000);
    } catch (error) {
      console.error("Lead automation failed", error);
      setAutomationFeedback({
        type: "error",
        userName: "",
      });

      setTimeout(() => {
        setAutomationFeedback(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-light">
      <Head>
        <link
          rel="preconnect"
          href="https://js-eu1.hs-scripts.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://js-eu1.hscollectedforms.net"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://js-eu1.hs-analytics.net"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://track-eu1.hubspot.com"
          crossOrigin="anonymous"
        />
        <link rel="preload" href="/assets/imagenes/hero-background.png" as="image" />
      </Head>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        src="/vendor/altcha.js"
        type="module"
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      {hasLoadedHubSpotScript && <HubSpotScript />}
      {/* Navigation and Language Toggle - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end gap-3">
        {/* Scroll Navigation Buttons */}
        <div className="flex flex-col gap-2">
          {/* Scroll Up Button - Show in middle and bottom sections */}
          {(scrollPosition === "middle" || scrollPosition === "bottom") && (
            <button
              onClick={scrollToTop}
              aria-label={language === "es" ? "Ir al inicio" : "Go to top"}
              className="group w-12 h-12 rounded-full bg-linear-to-br from-brown-dark via-taupe-medium to-brown-dark border-2 border-gold-warm/30 hover:border-gold-warm/60 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(162,144,96,0.4)] transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
            >
              <ChevronUp
                className="w-6 h-6 text-gold-warm group-hover:text-white transition-colors duration-300"
                strokeWidth={3}
              />
            </button>
          )}

          {/* Scroll Down Button - Show in top and middle sections */}
          {(scrollPosition === "top" || scrollPosition === "middle") && (
            <button
              onClick={scrollToBottom}
              aria-label={language === "es" ? "Ir al final" : "Go to bottom"}
              className="group w-12 h-12 rounded-full bg-linear-to-br from-brown-dark via-taupe-medium to-brown-dark border-2 border-gold-warm/30 hover:border-gold-warm/60 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(162,144,96,0.4)] transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
            >
              <ChevronDown
                className="w-6 h-6 text-gold-warm group-hover:text-white transition-colors duration-300"
                strokeWidth={3}
              />
            </button>
          )}
        </div>

        {/* Language Toggle - Simple */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="bg-white/95 backdrop-blur-sm border-brown-dark/20 hover:bg-cream-light text-brown-dark shadow-lg rounded-full px-4 py-2"
          aria-label={languageToggleAriaLabel}
        >
          <span className={language === "es" ? "font-bold" : "opacity-60"}>
            ES
          </span>
          <span className="mx-2 text-brown-dark/40">|</span>
          <span className={language === "en" ? "font-bold" : "opacity-60"}>
            EN
          </span>
        </Button>
      </div>

      {/* Sticky Navigation Menu - Anclora Style */}
      <nav
        className={`landing-nav fixed top-0 left-0 right-0 z-50 bg-cream-light/98 backdrop-blur-md border-b border-brown-dark/10 shadow-sm transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="landing-nav__inner container mx-auto px-4 md:px-6">
          <div className="landing-nav__bar flex items-center justify-between h-14 md:h-16">
            {/* Logo Anclora */}
            <div className="shrink-0">
              <button
                onClick={() => scrollToSection("anclora")}
                aria-label={
                  language === "es" ? "Ir a Anclora" : "Go to Anclora"
                }
                className="group relative text-brown-dark text-base md:text-lg font-bold tracking-tight transition-all duration-300 hover:text-gold-warm py-2 px-3 rounded-lg"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                <span className="relative">
                  ANCLORA
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-gold-warm via-[#8B7355] to-transparent group-hover:w-full transition-all duration-500 ease-out" />
                </span>
              </button>
            </div>

            {/* Desktop Menu - Centered (shows on tablet landscape and up) */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              <button
                onClick={() => scrollToSection("wynn-effect")}
                aria-label={t.menu.wynnEffect}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.wynnEffect}
              </button>
              <button
                onClick={() => scrollToSection("investment")}
                aria-label={t.menu.investment}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.investment}
              </button>
              <button
                onClick={() => scrollToSection("features")}
                aria-label={t.menu.features}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.features}
              </button>
              <button
                onClick={() => scrollToSection("gallery")}
                aria-label={t.menu.gallery}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.gallery}
              </button>
              <button
                onClick={() => scrollToSection("apartments")}
                aria-label={t.menu.apartments}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.apartments}
              </button>
              <button
                onClick={() => scrollToSection("location")}
                aria-label={t.menu.location}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.location}
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                aria-label={t.menu.faq}
                className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-xs md:text-sm font-normal px-2 md:px-3 py-2 hover:underline underline-offset-4 decoration-gold-warm hover:-translate-y-0.5"
              >
                {t.menu.faq}
              </button>
            </div>

            {/* Book Now Button - Desktop */}
            <div className="hidden md:block shrink-0">
              <Button
                onClick={() => scrollToSection("dossier")}
                className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm rounded-md shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {language === "es" ? "Dossier Exclusivo" : "Exclusive Dossier"}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden text-brown-dark hover:text-gold-warm p-2"
              aria-label={
                showMenu ? mobileMenuLabels.close : mobileMenuLabels.open
              }
              aria-expanded={showMenu}
              aria-controls="mobile-nav-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showMenu ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMenu && (
            <div
              id="mobile-nav-menu"
              className="md:hidden py-4 border-t border-brown-dark/10 bg-cream-light"
            >
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection("wynn-effect")}
                  aria-label={t.menu.wynnEffect}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.wynnEffect}
                </button>
                <button
                  onClick={() => scrollToSection("investment")}
                  aria-label={t.menu.investment}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.investment}
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  aria-label={t.menu.features}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.features}
                </button>
                <button
                  onClick={() => scrollToSection("gallery")}
                  aria-label={t.menu.gallery}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.gallery}
                </button>
                <button
                  onClick={() => scrollToSection("apartments")}
                  aria-label={t.menu.apartments}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.apartments}
                </button>
                <button
                  onClick={() => scrollToSection("location")}
                  aria-label={t.menu.location}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.location}
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  aria-label={t.menu.faq}
                  className="text-brown-dark/70 hover:text-brown-dark transition-all duration-200 text-sm font-normal text-left py-2 hover:underline underline-offset-4 decoration-gold-warm"
                >
                  {t.menu.faq}
                </button>
                <Button
                  onClick={() => scrollToSection("dossier")}
                  size="sm"
                  className="bg-gold-warm hover:bg-gold-warm/90 text-brown-dark font-semibold px-4 py-1.5 text-xs rounded-md shadow-md w-full mt-2 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {language === "es"
                    ? "Dossier Exclusivo"
                    : "Exclusive Dossier"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ==================== SECCIÓN: HERO ==================== */}
      {/* Hero Section */}
      <section
        id="hero"
        className="hero-section relative min-h-svh overflow-hidden pt-14 md:pt-0"
      >
        {/* Background */}
        <div
          className="absolute inset-0 z-0 transition-all ease-out"
          style={{
            opacity: animationStates.backgroundImage ? 1 : 0,
            transform: animationStates.backgroundImage
              ? "scale(1)"
              : "scale(1.05)",
            filter: animationStates.logo
              ? `brightness(${0.55 + scrollProgress * 0.45}) saturate(${
                  0.4 + scrollProgress * 0.6
                }) blur(${3 - scrollProgress * 3}px)`
              : "brightness(1) saturate(1) blur(0px)",
            transitionDuration: animationStates.logo ? "2000ms" : "700ms",
          }}
        >
          <Image
            src="/assets/imagenes/hero-background.png"
            alt="Playa Viva Al Marjan Island"
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div
          className="hero-content relative z-10 h-full flex flex-col items-center justify-center px-4"
          style={{
            opacity: 1 - scrollProgress,
            transition: "opacity 0.1s linear",
          }}
        >
          <div
            ref={heroStackRef}
            className="hero-container container max-w-6xl mx-auto"
            style={{
              transform: heroScale < 1 ? `scale(${heroScale})` : undefined,
              transformOrigin: "top center",
            }}
          >
            <div
              translate="no"
              className="hero-stack flex flex-col items-center justify-center text-center space-y-2 mt-0"
            >
              {/* Logo */}
              <div
                className="transition-all ease-out mt-12 flex justify-center"
                suppressHydrationWarning
                style={{
                  opacity: animationStates.logo ? 1 : 0,
                  transform: animationStates.logo ? "scale(1)" : "scale(0.3)",
                  filter: animationStates.logo ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2500ms",
                }}
              >
                <Image
                  src="/assets/imagenes/logo-azure-bay.webp"
                  alt="Azure Bay Logo"
                  width={384}
                  height={384}
                  className="h-44 sm:h-60 md:h-72 lg:h-80 xl:h-96 w-auto drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                  priority
                  sizes="(max-width: 640px) 176px, (max-width: 768px) 240px, (max-width: 1024px) 288px, (max-width: 1280px) 320px, 384px"
                />
              </div>

              {/* Subtitle pill: stronger background for readability + gold halo */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.subtitle ? 1 : 0,
                  transform: animationStates.subtitle
                    ? "scale(1)"
                    : "scale(0.3)",
                  filter: animationStates.subtitle ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="hero-subtitle inline-block bg-black/65 sm:bg-black/55 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 border border-gold-warm/60 ring-2 ring-gold-warm/75 shadow-[0_0_40px_rgba(162,144,96,0.7)]">
                  <p className="font-arabic text-gold-warm text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-[0.02em] sm:tracking-[0.04em] md:tracking-[0.06em] uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.65)] whitespace-nowrap">
                    {t.hero.subtitle}
                  </p>
                </div>
              </div>

              {/* Description - Sophisticated styling and legibility */}
              <div
                className="transition-all ease-out max-w-5xl"
                style={{
                  opacity: animationStates.description ? 1 : 0,
                  transform: animationStates.description
                    ? "scale(1)"
                    : "scale(0.3)",
                  filter: animationStates.description
                    ? "blur(0px)"
                    : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="hero-description relative mx-auto px-2 max-w-4xl">
                  <p className="relative text-[#FFFFFF] text-sm sm:text-base md:text-lg font-medium px-3 sm:px-6 py-2 sm:py-3 tracking-[0.01em] text-center leading-relaxed">
                    {t.hero.description}
                  </p>
                </div>
              </div>

              {/* Price Card: solid background enforced + stronger gold halo on hover */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.priceBox ? 1 : 0,
                  transform: animationStates.priceBox
                    ? "scale(1)"
                    : "scale(0.3)",
                  filter: animationStates.priceBox ? "blur(0px)" : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="relative">
                  <div
                    className="hero-price-card rounded-2xl p-3 sm:p-4 shadow-2xl max-w-[90vw] sm:max-w-160 mx-auto transition-all duration-200 border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 hover:-translate-y-[3px] hover:ring-gold-warm/85 hover:shadow-[0_24px_52px_rgba(0,0,0,0.6),0_0_56px_rgba(162,144,96,0.7)]"
                    style={{ backgroundColor: "#6E5F46" }} // sólido y opaco garantizado
                  >
                    <div className="space-y-1.5 sm:space-y-2 text-center">
                      <div className="hero-price-value text-gold-warm text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap [text-shadow:1px_1px_3px_rgba(0,0,0,0.9)]">
                        {pricePrefix}
                        {"\u00A0"}
                        {priceString}
                      </div>
                      <div className="hero-price-payment text-cream-light text-xs sm:text-sm md:text-base font-medium [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                        {t.hero.payment}
                      </div>
                      <div className="hero-price-handover text-cream-light text-xs sm:text-xs md:text-sm font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
                        {t.hero.handover}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button: Single Dossier download button centered */}
              <div
                className="transition-all ease-out"
                style={{
                  opacity: animationStates.ctaButtons ? 1 : 0,
                  transform: animationStates.ctaButtons
                    ? "scale(1)"
                    : "scale(0.3)",
                  filter: animationStates.ctaButtons
                    ? "blur(0px)"
                    : "blur(12px)",
                  transitionDuration: "2000ms",
                }}
              >
                <div className="flex flex-col gap-3 items-center">
                  <Button
                    onClick={() => scrollToSection("dossier")}
                    size="lg"
                    className="hero-cta bg-gold-warm text-brown-dark font-bold antialiased tracking-wide px-10 py-4 text-base sm:text-lg rounded-xl border-2 border-brown-dark/85 ring-2 ring-gold-warm/65 shadow-2xl transition-all duration-200 hover:bg-gold-warm/80 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.55),0_0_48px_rgba(162,144,96,0.65)] hover:ring-gold-warm/85 hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <Download className="h-5 w-5" />
                      <span>
                        {language === "es"
                          ? "Dossier Exclusivo"
                          : "Exclusive Dossier"}
                      </span>
                    </span>
                  </Button>

                  {/* Scroll Indicator (sm+) */}
                  <div
                    className="hero-scroll-indicator mt-2 hidden sm:flex justify-center pointer-events-none animate-bounce"
                    style={{
                      opacity: animationStates.scrollIndicator ? 1 : 0,
                      transform: animationStates.scrollIndicator
                        ? "translateY(0px)"
                        : "translateY(20px)",
                    }}
                  >
                    <div className="w-6 h-10 border-2 border-yellow-400/70 rounded-full flex items-start justify-center p-2">
                      <div className="w-1.5 h-3 bg-yellow-400/80 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECCIÓN: WYNN EFFECT ==================== */}
      {/* The Wynn Effect - CRITICAL SECTION */}
      <section
        id="wynn-effect"
        ref={wynnEffectRef}
        className="relative py-20 md:py-32 bg-linear-to-br from-brown-dark via-brown-dark to-olive-brown overflow-hidden"
        style={{
          opacity: visibleSections.wynnEffect ? 1 : 0,
          transform: visibleSections.wynnEffect
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${`var(--gold-warm)`} 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <LuxuryBadge
              label={
                language === "es"
                  ? "Oportunidad Histórica"
                  : "Historic Opportunity"
              }
            />
            <h2
              className="text-4xl md:text-6xl font-light text-cream-light mb-6 font-arabic"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            >
              {t.wynnEffect.title}
            </h2>
            <h3
              className="text-xl md:text-2xl text-gold-warm mb-8"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              {t.wynnEffect.subtitle}
            </h3>
            <p
              className="text-cream-light/90 text-base md:text-lg leading-relaxed"
              style={{
                opacity: visibleSections.wynnEffect ? 1 : 0,
                transform: visibleSections.wynnEffect
                  ? "translateY(0px)"
                  : "translateY(20px)",
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
              }}
            >
              {t.wynnEffect.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-6xl mx-auto">
            {t.wynnEffect.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white border-2 border-gold-warm/40 rounded-2xl p-8 text-center shadow-xl hover:border-gold-warm hover:shadow-2xl hover:shadow-gold-warm/30 transition-all duration-300 hover:-translate-y-2"
                style={{
                  opacity: visibleSections.wynnEffect ? 1 : 0,
                  transform: visibleSections.wynnEffect
                    ? "translateY(0px)"
                    : "translateY(30px)",
                  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                    0.4 + index * 0.1
                  }s`,
                }}
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-gold-warm/20 p-4 rounded-full">
                    <stat.icon className="h-10 w-10 text-gold-warm" />
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold text-gold-warm mb-3">
                  {stat.value}
                </div>
                <h4 className="text-brown-dark text-lg md:text-xl font-semibold mb-2">
                  {stat.label}
                </h4>
                <p className="text-taupe-warm text-sm">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          {/* Urgency Banner */}
          <div
            className="max-w-4xl mx-auto bg-linear-to-r from-gold-warm/20 via-gold-warm/30 to-gold-warm/20 border-2 border-gold-warm rounded-2xl p-8 md:p-12"
            style={{
              opacity: visibleSections.wynnEffect ? 1 : 0,
              transform: visibleSections.wynnEffect
                ? "translateY(0px)"
                : "translateY(30px)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.7s",
            }}
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-cream-light mb-4">
                {t.wynnEffect.urgency.title}
              </h3>
              <p className="text-cream-light/90 text-base md:text-lg leading-relaxed mb-6">
                {t.wynnEffect.urgency.description}
              </p>
              <div className="inline-block bg-brown-dark/50 rounded-lg px-6 py-3 border border-gold-warm/40">
                <p className="text-gold-warm font-semibold text-sm md:text-base tracking-wide">
                  {t.wynnEffect.urgency.countdown}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MENÚ: INVERSIÓN ==================== */}
      {/* INVESTMENT_1: OPORTUNIDAD DE INVERSIÓN */}
      <section
        id="investment"
        ref={investmentRef}
        translate="no"
        className="relative py-24 bg-white"
        style={{
          opacity: visibleSections.investment ? 1 : 0,
          transform: visibleSections.investment
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h2
                className="text-4xl md:text-5xl font-light text-brown-dark mb-6"
                style={{
                  opacity: visibleSections.investment ? 1 : 0,
                  transform: visibleSections.investment
                    ? "translateY(0px)"
                    : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {t.investment.title}
              </h2>
              <h3
                className="text-2xl text-gold-warm mb-8"
                style={{
                  opacity: visibleSections.investment ? 1 : 0,
                  transform: visibleSections.investment
                    ? "translateY(0px)"
                    : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
                }}
              >
                {t.investment.subtitle}
              </h3>
              <p
                className="text-taupe-warm text-base md:text-lg leading-relaxed max-w-3xl mx-auto"
                style={{
                  opacity: visibleSections.investment ? 1 : 0,
                  transform: visibleSections.investment
                    ? "translateY(0px)"
                    : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
                }}
              >
                {t.investment.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {t.investment.stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-cream-light border-2 border-gold-warm/30 rounded-2xl p-6 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-2"
                  style={{
                    opacity: visibleSections.investment ? 1 : 0,
                    transform: visibleSections.investment
                      ? "translateY(0px)"
                      : "translateY(30px)",
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                      0.3 + index * 0.1
                    }s`,
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-gold-warm/20 p-3 rounded-full">
                      <stat.icon className="h-8 w-8 text-gold-warm" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gold-warm mb-2 text-center">
                    {stat.value}
                  </div>
                  <h4 className="text-brown-dark font-semibold mb-2 text-center text-sm md:text-base">
                    {stat.label}
                  </h4>
                  <p className="text-taupe-warm text-xs md:text-sm text-center leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {t.investment.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start p-5 bg-cream-light/50 rounded-xl border border-gold-warm/20 hover:bg-cream-light hover:border-gold-warm/40 transition-all duration-300"
                  style={{
                    opacity: visibleSections.investment ? 1 : 0,
                    transform: visibleSections.investment
                      ? "translateY(0px)"
                      : "translateY(20px)",
                    transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                      0.7 + index * 0.1
                    }s`,
                  }}
                >
                  <CheckCircle2 className="h-6 w-6 text-gold-warm mr-3 shrink-0 mt-0.5" />
                  <span className="text-brown-dark text-left text-sm md:text-base">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INVESTMENT_2: PLAN DE PAGO */}
      <section
        className="relative py-24 bg-cream-light"
        style={{
          opacity: visibleSections.investment ? 1 : 0,
          transform: visibleSections.investment
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-6">
                {t.paymentPlan.title}
              </h2>
              <p className="text-taupe-warm text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                {t.paymentPlan.subtitle}
              </p>
            </div>

            {/* Main Payment Structure */}
            <div className="max-w-4xl mx-auto mb-16">
              {/* 40% / 60% Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="group relative overflow-hidden text-center p-8 bg-linear-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] rounded-3xl border-2 border-gold-warm/40 shadow-lg hover:shadow-2xl hover:border-gold-warm/60 transition-all duration-500">
                  <div className="absolute inset-0 bg-linear-to-br from-gold-warm/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-gold-warm/50 to-transparent group-hover:via-gold-warm transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="text-6xl md:text-7xl font-light text-gold-warm mb-2 group-hover:text-[#8B7355] transition-colors duration-300">
                      {t.paymentPlan.mainPayment}
                    </div>
                    <p className="text-taupe-warm text-sm md:text-base mb-4 font-medium">
                      {t.paymentPlan.mainLabel}
                    </p>
                    <p className="text-brown-dark text-xs md:text-sm leading-relaxed">
                      {t.paymentPlan.description}
                    </p>
                  </div>
                </div>

                <div className="group relative overflow-hidden text-center p-8 bg-linear-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] rounded-3xl border-2 border-gold-warm/40 shadow-lg hover:shadow-2xl hover:border-gold-warm/60 transition-all duration-500">
                  <div className="absolute inset-0 bg-linear-to-br from-gold-warm/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-gold-warm/50 to-transparent group-hover:via-gold-warm transition-all duration-500" />
                  <div className="relative z-10">
                    <div className="text-6xl md:text-7xl font-light text-gold-warm mb-2 group-hover:text-[#8B7355] transition-colors duration-300">
                      {t.paymentPlan.postHandover}
                    </div>
                    <p className="text-taupe-warm text-sm md:text-base mb-4 font-medium">
                      {t.paymentPlan.postLabel}
                    </p>
                    <p className="text-brown-dark text-xs md:text-sm leading-relaxed">
                      {t.paymentPlan.postDetails}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mb-12">
                <div className="flex gap-0 h-16 rounded-full overflow-hidden shadow-lg border-2 border-gold-warm/20">
                  <div className="w-2/5 bg-gold-warm flex items-center justify-center">
                    <span className="text-white font-bold text-sm md:text-base">
                      40% {language === "es" ? "Ahora" : "Now"}
                    </span>
                  </div>
                  <div className="w-3/5 bg-blue-50 flex items-center justify-center">
                    <span className="text-brown-dark font-bold text-sm md:text-base">
                      60% {language === "es" ? "Post-Entrega" : "Post-Handover"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4 mb-12">
                {t.paymentPlan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden flex items-start p-6 bg-linear-to-r from-[#f5f1ea] to-[#ede8df] rounded-2xl border border-gold-warm/30 hover:border-gold-warm/60 shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      opacity: visibleSections.investment ? 1 : 0,
                      transform: visibleSections.investment
                        ? "translateY(0px)"
                        : "translateY(20px)",
                      transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${
                        1 + index * 0.1
                      }s`,
                    }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-gold-warm/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CheckCircle2 className="h-6 w-6 text-gold-warm mr-4 shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" />
                    <span className="text-brown-dark text-left text-sm md:text-base relative z-10">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* New Premium Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {t.paymentPlan.cards &&
                  t.paymentPlan.cards.map((card, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden p-8 bg-linear-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] rounded-3xl border-2 border-gold-warm/40 shadow-lg hover:shadow-2xl hover:border-gold-warm/60 transition-all duration-500"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-gold-warm/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-gold-warm/50 to-transparent group-hover:via-gold-warm transition-all duration-500" />
                      <div className="relative z-10">
                        <p className="text-center text-brown-dark text-base md:text-lg font-medium leading-relaxed italic">
                          &ldquo;{card.text}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INVESTMENT_3: RESPALDADO POR LÍDERES & NOTICIAS ==================== */}
      {/* Trust & Credibility */}
      <section
        ref={trustRef}
        className="relative py-20 bg-cream-light"
        style={{
          opacity: visibleSections.trust ? 1 : 0,
          transform: visibleSections.trust
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-brown-dark mb-4">
                {t.trust.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.trust.subtitle}
              </h3>
              <p className="text-taupe-warm text-base md:text-lg max-w-3xl mx-auto">
                {t.trust.description}
              </p>
            </div>

            {/* Press Coverage */}
            <div className="mb-12">
              <p className="text-center text-sm text-taupe-warm mb-6 uppercase tracking-wider">
                {t.trust.partners}
              </p>

              {/* Desktop/Tablet: Horizontal Scroll */}
              <div className="hidden md:block">
                <div className="relative">
                  <div
                    className="flex gap-8 overflow-x-auto pb-4 px-0 items-stretch justify-start scrollbar-thin scrollbar-thumb-gold-warm/40 scrollbar-track-gold-warm/10"
                    style={{
                      scrollBehavior: "smooth",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {t.trust.articles.map((article, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-1 w-full min-w-[320px] max-w-xs flex flex-col shrink-0"
                        style={{
                          opacity: visibleSections.trust ? 1 : 0,
                          transform: visibleSections.trust
                            ? "translateY(0px)"
                            : "translateY(30px)",
                          transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                            index * 0.15
                          }s`,
                        }}
                      >
                        <Image
                          src={article.image}
                          alt={article.alt}
                          width={480}
                          height={320}
                          className="w-full h-48 md:h-56 object-cover grayscale-hover rounded-xl"
                          sizes="(max-width: 768px) 80vw, 20vw"
                        />
                        <div className="mt-4 space-y-2 flex-1 flex flex-col">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-dark/60">
                              {article.source}
                            </p>
                            {article.date && (
                              <p className="text-xs text-taupe-warm">
                                {article.date}
                              </p>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-brown-dark leading-snug">
                            {article.title}
                          </h4>
                          <p className="text-sm text-brown-dark/70 flex-1">
                            {article.summary}
                          </p>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gold-warm hover:underline"
                          >
                            {t.trust.readMore}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M7 17 17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: Vertical Scroll */}
              <div className="md:hidden">
                <div
                  className="flex flex-col gap-6 overflow-y-auto max-h-[900px] px-0 scrollbar-thin scrollbar-thumb-gold-warm/40 scrollbar-track-gold-warm/10"
                  style={{
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {t.trust.articles.map((article, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-1 flex flex-col w-full"
                      style={{
                        opacity: visibleSections.trust ? 1 : 0,
                        transform: visibleSections.trust
                          ? "translateY(0px)"
                          : "translateY(30px)",
                        transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${
                          index * 0.15
                        }s`,
                      }}
                    >
                      <Image
                        src={article.image}
                        alt={article.alt}
                        width={480}
                        height={320}
                        className="w-full h-48 md:h-56 object-cover grayscale-hover rounded-xl"
                        sizes="(max-width: 768px) 80vw, 20vw"
                      />
                      <div className="mt-4 space-y-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-dark/60">
                            {article.source}
                          </p>
                          {article.date && (
                            <p className="text-xs text-taupe-warm">
                              {article.date}
                            </p>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-brown-dark leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-sm text-brown-dark/70 flex-1">
                          {article.summary}
                        </p>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gold-warm hover:underline"
                        >
                          {t.trust.readMore}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M7 17 17 7" />
                            <path d="M7 7h10v10" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MENÚ: FEATURES ==================== */}
      {/* Features Section - 4 Subsections */}
      <section
        id="features"
        ref={featuresRef}
        translate="no"
        className="relative py-24 bg-cream-light space-y-24"
        style={{
          opacity: visibleSections.features ? 1 : 0,
          transform: visibleSections.features
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* ==================== FEATURES_1: DEVELOPMENT STRUCTURE ==================== */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.features.development.title}
              </h2>
              <h3 className="text-xl md:text-2xl text-gold-warm mb-6">
                {t.features.development.tagline}
              </h3>
              <div className="space-y-3 max-w-3xl mx-auto">
                {t.features.development.description.map((text, index) => (
                  <p
                    key={index}
                    className="text-taupe-warm text-base md:text-lg leading-relaxed"
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-2">
              <Image
                src={t.features.development.image}
                alt={t.features.development.title}
                width={1200}
                height={800}
                className="w-full h-auto object-cover grayscale-hover"
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/10 to-transparent p-6">
                <h4 className="text-white text-2xl font-semibold drop-shadow-lg">
                  {t.features.development.title}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FEATURES_2: SPECIFICATIONS ==================== */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.features.specifications.title}
              </h2>
              <h3 className="text-xl md:text-2xl text-gold-warm">
                {t.features.specifications.tagline}
              </h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.features.specifications.cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-2"
                  style={{
                    opacity: visibleSections.features ? 1 : 0,
                    transform: visibleSections.features
                      ? "translateY(0px)"
                      : "translateY(30px)",
                    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
                  }}
                >
                  <h3 className="text-2xl font-semibold text-brown-dark mb-3">
                    {card.title}
                  </h3>
                  <p className="text-lg text-gold-warm mb-2 font-medium">
                    {card.size}
                  </p>
                  <p className="text-xl font-bold text-brown-dark mb-4">
                    {card.price}
                  </p>
                  <p className="text-sm text-taupe-warm leading-relaxed">
                    {card.features}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== FEATURES_3: PLAYA VIVA VIEWS ==================== */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.features.playaViva.title}
              </h2>
              <h3 className="text-xl md:text-2xl text-gold-warm">
                {t.features.playaViva.tagline}
              </h3>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {t.features.playaViva.tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActivePlayaVivaTab(index)}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                    activePlayaVivaTab === index
                      ? "bg-gold-warm text-brown-dark shadow-lg"
                      : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Tab Content */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300">
              <Image
                src={t.features.playaViva.tabs[activePlayaVivaTab].image}
                alt={t.features.playaViva.tabs[activePlayaVivaTab].label}
                width={1200}
                height={800}
                className="w-full h-auto object-cover grayscale-hover"
                sizes="(max-width: 1024px) 100vw, 75vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-8">
                <h4 className="text-white text-2xl md:text-3xl font-semibold mb-2 drop-shadow-lg">
                  {t.features.playaViva.tabs[activePlayaVivaTab].label}
                </h4>
                <p className="text-white/90 text-base md:text-lg drop-shadow-md">
                  {t.features.playaViva.tabs[activePlayaVivaTab].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FEATURES_4: AMENITIES CAROUSEL ==================== */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.features.amenities.title}
              </h2>
              <h3 className="text-xl md:text-2xl text-gold-warm">
                {t.features.amenities.tagline}
              </h3>
            </div>

            {/* Desktop: Horizontal Scroll */}
            <div className="hidden md:block">
              <div
                className="flex gap-6 overflow-x-auto pb-6 px-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gold-warm/40 scrollbar-track-gold-warm/10"
                style={{
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {t.features.amenities.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex-none w-64 snap-center bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300 hover:-translate-y-2"
                    style={{
                      opacity: visibleSections.features ? 1 : 0,
                      transform: visibleSections.features
                        ? "translateY(0px)"
                        : "translateY(30px)",
                      transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover grayscale-hover"
                        sizes="256px"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-brown-dark mb-3">
                        {item.title}
                      </h4>
                      <p className="text-sm text-taupe-warm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical Scroll */}
            <div className="md:hidden">
              <div
                className="flex flex-col gap-6 overflow-y-auto max-h-[900px] px-0 scrollbar-thin scrollbar-thumb-gold-warm/40 scrollbar-track-gold-warm/10"
                style={{
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {t.features.amenities.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gold-warm/20 hover:border-gold-warm hover:shadow-xl hover:shadow-gold-warm/10 transition-all duration-300"
                    style={{
                      opacity: visibleSections.features ? 1 : 0,
                      transform: visibleSections.features
                        ? "translateY(0px)"
                        : "translateY(30px)",
                      transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`,
                    }}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover grayscale-hover"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold text-brown-dark mb-3">
                        {item.title}
                      </h4>
                      <p className="text-sm text-taupe-warm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MENÚ: GALERÍA ==================== */}
      {/* Gallery */}
      <section
        id="gallery"
        ref={galleryRef}
        className="relative py-24 bg-white"
        style={{
          opacity: visibleSections.gallery ? 1 : 0,
          transform: visibleSections.gallery
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-6">
              {t.gallery.title}
            </h2>
            <h3 className="text-2xl text-gold-warm mb-6">
              {t.gallery.subtitle}
            </h3>
            <p className="text-taupe-warm text-base md:text-lg leading-relaxed">
              {t.gallery.description}
            </p>
          </div>

          {/* Gallery Tabs */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button
              onClick={() => setActiveGalleryTab("servicios")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "servicios"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es"
                ? "Servicios e Instalaciones"
                : "Services & Facilities"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("interior")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "interior"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Interiores" : "Interiors"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("sitios")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "sitios"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Sitios de Interés" : "Points of Interest"}
            </button>
            <button
              onClick={() => setActiveGalleryTab("video")}
              className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeGalleryTab === "video"
                  ? "bg-gold-warm text-brown-dark shadow-lg"
                  : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
              }`}
            >
              {language === "es" ? "Video" : "Video"}
            </button>
          </div>

          {/* Servicios e Instalaciones */}
          {activeGalleryTab === "servicios" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-2">
                <Image
                  src="/assets/imagenes/Collage-servicios-instalaciones.webp"
                  alt="Servicios e Instalaciones - Playa Viva"
                  className="w-full h-auto object-cover grayscale-hover"
                  width={1210}
                  height={968}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
              </div>
            </div>
          )}

          {/* Interior */}
          {activeGalleryTab === "interior" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-2">
                <Image
                  src={
                    language === "es"
                      ? "/assets/imagenes/collage-interiores-es.webp"
                      : "/assets/imagenes/collage-interiores-en.webp"
                  }
                  alt={
                    language === "es"
                      ? "Collage de interiores"
                      : "Interiors collage"
                  }
                  className="w-full h-auto object-cover grayscale-hover"
                  width={1210}
                  height={968}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
              </div>
            </div>
          )}

          {/* Sitios de Interés */}
          {activeGalleryTab === "sitios" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl hover:border-gold-warm hover:shadow-gold-warm/20 transition-all duration-300 hover:-translate-y-2">
                <Image
                  src={
                    language === "es"
                      ? "/assets/imagenes/Collage_Sitios_Interes_Mejorado-es.webp"
                      : "/assets/imagenes/Collage_Sitios_Interes_Mejorado-en.webp"
                  }
                  alt={
                    language === "es"
                      ? "Sitios de interes cercanos a Playa Viva"
                      : "Points of interest near Playa Viva"
                  }
                  className="w-full h-auto object-cover grayscale-hover"
                  width={1210}
                  height={968}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
              </div>
            </div>
          )}

          {/* Video */}
          {activeGalleryTab === "video" && (
            <div className="max-w-6xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden border-2 border-gold-warm/40 shadow-2xl bg-black aspect-video">
                <iframe
                  src="https://player.cloudinary.com/embed/?cloud_name=dt6lzvqqk&public_id=video_promocional_fbzuoq&profile=cld-default"
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="Video promocional Azure Bay"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================== MENÚ: APARTAMENTOS ==================== */}
      {/* Apartments */}
      <section
        id="apartments"
        ref={apartmentsRef}
        translate="no"
        className="relative py-24 bg-linear-to-br from-cream-light via-white to-cream-light"
        style={{
          opacity: visibleSections.apartments ? 1 : 0,
          transform: visibleSections.apartments
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-light text-brown-dark mb-4">
                {t.apartments.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.apartments.subtitle}
              </h3>
              <p className="text-taupe-warm text-base md:text-lg max-w-3xl mx-auto">
                {t.apartments.description}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-12 flex-wrap">
              {(["studio", "oneBed", "twoBed", "threeBed"] as const).map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => setActiveApartment(key)}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                      activeApartment === key
                        ? "bg-gold-warm text-brown-dark shadow-lg"
                        : "bg-cream-light text-brown-dark/70 hover:bg-cream-light/80 hover:text-brown-dark"
                    }`}
                  >
                    {t.apartments.tabs[key].label}
                  </button>
                )
              )}
            </div>

            <div className="space-y-10">
              <div
                className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-gold-warm/30 shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.25)]"
                style={{
                  opacity: visibleSections.apartments ? 1 : 0,
                  transform: visibleSections.apartments
                    ? undefined
                    : "translateY(30px)",
                  transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <Image
                  src={activeApartmentConfig.image}
                  alt={apartmentCopy.headline}
                  width={1600}
                  height={1000}
                  unoptimized
                  className="w-full h-full object-cover grayscale-hover"
                  sizes="(max-width: 768px) 100vw, 75vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/10 to-transparent p-6">
                  <p className="text-sm text-white uppercase tracking-[0.3em]">
                    {apartmentCopy.label}
                  </p>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border border-brown-dark/10 max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-brown-dark/60">
                    {apartmentCopy.label}
                  </p>
                  <h3 className="text-2xl md:text-4xl font-light text-brown-dark">
                    {apartmentCopy.headline}
                  </h3>
                  <p className="text-brown-dark/80 text-base md:text-lg">
                    {apartmentCopy.description}
                  </p>
                  <div className="space-y-3 pt-4">
                    {highlightItems.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-gold-warm/20 rounded-full p-1 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-gold-warm" />
                        </div>
                        <p className="text-brown-dark/80 text-sm">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.size}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatSizeRange(activeApartmentConfig.sizeSqftRange)}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.price}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {activeApartmentPrice}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.bedrooms}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatBedroomValue(activeApartmentConfig.bedrooms)}
                    </p>
                  </div>
                  <div className={statCardBaseClasses}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.bathrooms}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {formatBathroomValue(activeApartmentConfig.bathrooms)}
                    </p>
                  </div>
                  <div className={`${statCardBaseClasses} sm:col-span-2`}>
                    <p className="text-xs uppercase tracking-[0.3em] text-brown-dark/50 mb-1">
                      {infoLabels.parking}
                    </p>
                    <p className="text-lg font-semibold text-brown-dark">
                      {apartmentCopy.parking}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MENÚ: UBICACIÓN ==================== */}
      {/* Location */}
      <section
        id="location"
        ref={locationRef}
        className="relative py-24 bg-cream-light"
        style={{
          opacity: visibleSections.location ? 1 : 0,
          transform: visibleSections.location
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-light text-brown-dark mb-4">
                {t.location.title}
              </h2>
              <h3 className="text-xl text-gold-warm mb-4">
                {t.location.subtitle}
              </h3>
              <p className="text-taupe-warm text-base leading-relaxed max-w-4xl mx-auto">
                {t.location.description}
              </p>
            </div>

            {/* Premium Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {t.location.stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] p-6 md:p-8 border border-gold-warm/40 shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-gold-warm/60"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-gold-warm/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-full bg-linear-to-r from-transparent via-gold-warm/50 to-transparent group-hover:via-gold-warm transition-all duration-500" />

                  {/* Content */}
                  <div className="relative z-10 text-center">
                    <div className="text-4xl md:text-5xl font-light text-gold-warm mb-3 group-hover:text-[#8B7355] transition-colors duration-300">
                      {stat.number}
                    </div>
                    <p className="text-sm md:text-base font-medium text-brown-dark leading-snug">
                      {language === "es" ? stat.label : stat.labelEn}
                    </p>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px rounded-full bg-linear-to-r from-transparent via-gold-warm/30 to-transparent group-hover:via-gold-warm/60 transition-all duration-500" />
                </div>
              ))}
            </div>

            {/* Botones de navegación */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setLocationView("collage")}
                className={`px-8 py-3.5 rounded-[20px] font-medium text-sm transition-all duration-300 shadow-md ${
                  locationView === "collage"
                    ? "bg-[#9d8c5f] text-[#3a2f1f] shadow-lg"
                    : "bg-[#e3ded4] text-[#5a4f3d] hover:bg-[#d8d3c9]"
                }`}
              >
                Azure Bay District
              </button>
              <button
                onClick={() => setLocationView("map")}
                className={`px-8 py-3.5 rounded-[20px] font-medium text-sm transition-all duration-300 shadow-md ${
                  locationView === "map"
                    ? "bg-[#9d8c5f] text-[#3a2f1f] shadow-lg"
                    : "bg-[#e3ded4] text-[#5a4f3d] hover:bg-[#d8d3c9]"
                }`}
              >
                {language === "es" ? "Mapa del Área" : "Area Map"}
              </button>
            </div>

            {/* Vista condicional */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-warm/30 transition-all duration-300 hover:-translate-y-2 hover:border-gold-warm hover:shadow-gold-warm/20">
              {locationView === "map" ? (
                <Image
                  src="/assets/imagenes/Ubicacion_Azurebay.webp"
                  alt="Azure Bay Area Map"
                  className="w-full h-auto object-cover grayscale-hover"
                  width={1200}
                  height={800}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
              ) : (
                <Image
                  src="/assets/imagenes/Collage_Azurebay.webp"
                  alt="Azure Bay Collage"
                  className="w-full h-auto object-cover grayscale-hover"
                  width={1200}
                  height={900}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MENÚ: PREGUNTAS FRECUENTES ==================== */}
      {/* FAQ */}
      <section
        id="faq"
        ref={faqRef}
        translate="no"
        className="relative py-12 md:py-16 bg-[#d4c5a8]"
        style={{
          opacity: visibleSections.faq ? 1 : 0,
          transform: visibleSections.faq
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(162,144,96,0.3) 1px, transparent 0)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Títulos centrados */}
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-brown-dark mb-3 md:mb-4">
              {t.faq.title}
            </h2>
            <p className="text-base md:text-lg text-[#6d5d42] font-medium">
              {t.faq.subtitle}
            </p>
          </div>

          {/* Card con preguntas - centrado y más estrecho */}
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl bg-linear-to-br from-[#f5f1ea]/95 via-white/90 to-[#ede8df]/95 border-2 border-[#A29060]/40 shadow-[0_16px_48px_rgba(162,144,96,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset] divide-y divide-[#A29060]/15 overflow-hidden">
              {t.faq.questions.map((qa, index) => (
                <div
                  key={qa.question}
                  className={`px-4 md:px-5 py-3 md:py-4 transition-all duration-300 cursor-default group/item relative ${
                    activeFaq === index
                      ? "bg-[#e8dcc8] shadow-[0_4px_16px_rgba(162,144,96,0.2)] scale-[1.02] z-10"
                      : "hover:bg-linear-to-r hover:from-[#A29060]/5 hover:to-transparent"
                  }`}
                  onMouseEnter={() => setActiveFaq(index)}
                  onMouseLeave={() => setActiveFaq(null)}
                  onFocus={() => setActiveFaq(index)}
                  onBlur={() => setActiveFaq(null)}
                  tabIndex={0}
                >
                  <p
                    className={`text-xs md:text-sm font-semibold transition-colors duration-300 ${
                      activeFaq === index ? "text-[#271c13]" : "text-[#6E5F46]"
                    }`}
                  >
                    {qa.question}
                  </p>
                  <div
                    className={`text-[11px] md:text-xs text-[#4a3f30] leading-relaxed transition-all duration-300 ${
                      activeFaq === index
                        ? "max-h-40 opacity-100 mt-2"
                        : "max-h-0 opacity-0 mt-0 pointer-events-none"
                    }`}
                  >
                    {qa.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FORMULARIO: DOSSIER EXCLUSIVO ==================== */}
      {/* Lead Magnet - Exclusive Dossier Form */}
      <section
        id="dossier"
        ref={leadFormRef}
        className="relative py-20 pb-32 bg-linear-to-b from-brown-dark via-[#22170f] to-brown-dark overflow-hidden"
        style={{
          opacity: visibleSections.leadForm ? 1 : 0,
          transform: visibleSections.leadForm
            ? "translateY(0px)"
            : "translateY(50px)",
          transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, transparent 50%, transparent 60%, rgba(255,255,255,0.08) 100%)",
            }}
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <LuxuryBadge
              label={
                language === "es"
                  ? "Dossier de Inversión Exclusivo"
                  : "Exclusive Investment Dossier"
              }
            />
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <p className="text-[#271c13] text-base md:text-lg leading-relaxed font-medium">
                {t.leadForm.intro}
              </p>
              <p className="text-cream-light text-sm leading-relaxed">
                {t.leadForm.description}
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
              <div className="space-y-6">
                <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-3">
                  {featureColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="space-y-2.5 text-left">
                      {column.map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <div className="bg-gold-warm/25 rounded-full p-1.5 mt-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-gold-warm" />
                          </div>
                          <p className="text-[#c9b896] text-sm leading-relaxed">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm shadow-inner">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold-warm/20 text-gold-warm flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {altchaTitle}
                        </p>
                        <p className="text-xs text-white/75 leading-relaxed">
                          {altchaCopy}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm shadow-inner">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold-warm/20 text-gold-warm flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {consentTitle}
                        </p>
                        <p className="text-xs text-white/75 leading-relaxed">
                          {consentCopy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="w-full rounded-3xl border-2 border-gold-warm/40 bg-linear-to-br from-[#f5f1ea] via-[#ede8df] to-[#e8e3d8] shadow-[0_20px_60px_rgba(162,144,96,0.35),0_0_80px_rgba(162,144,96,0.15),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-sm px-6 md:px-10 py-7 relative overflow-hidden group transition-all duration-500 hover:shadow-[0_28px_80px_rgba(162,144,96,0.6),0_0_120px_rgba(162,144,96,0.35),0_0_0_2px_rgba(162,144,96,0.5)_inset,0_2px_4px_rgba(255,255,255,1)_inset] hover:scale-[1.01] hover:border-[#d4b876]">
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl bg-linear-to-r from-transparent via-[#A29060]/60 to-transparent group-hover:via-[#d4b876] transition-all duration-500"></div>
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1200 ease-out"></div>
                  <div
                    className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle at top right, rgba(162,144,96,0.25), transparent 60%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle at bottom left, rgba(184,166,115,0.2), transparent 50%)",
                    }}
                  />
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[#A29060]/0 via-[#A29060]/0 to-[#A29060]/0 group-hover:from-[#A29060]/8 group-hover:via-white/15 group-hover:to-[#d4b876]/8 transition-all duration-500"></div>
                  <div
                    className="absolute inset-0 rounded-3xl opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, #A29060 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>
                  <form
                    onSubmit={handleLeadSubmit}
                    className="space-y-5 text-left relative z-10"
                  >
                    {validationMessage && (
                      <div
                        className="rounded-2xl border border-gold-warm/30 bg-white/90 px-4 py-3 text-xs text-brown-dark flex items-center gap-2 shadow-sm"
                        role="alert"
                        aria-live="polite"
                      >
                        <ShieldCheck className="h-4 w-4 text-gold-warm" />
                        <span>{validationMessage.message}</span>
                      </div>
                    )}
                    <div className="grid md:grid-cols-[0.7fr_1.3fr] gap-3">
                      <div>
                        <label
                          htmlFor="lead-first-name"
                          className="block text-brown-dark/80 font-medium mb-1.5 text-xs"
                        >
                          {t.leadForm.form.firstNamePlaceholder}
                          <span className="text-brown-dark/80">*</span>
                        </label>
                        <input
                          ref={firstNameRef}
                          id="lead-first-name"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            });
                            if (validationMessage?.field === "firstName") {
                              setValidationMessage(null);
                            }
                          }}
                          aria-invalid={
                            validationMessage?.field === "firstName"
                          }
                          className={`w-full px-3 py-2 border rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/85 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md ${
                            validationMessage?.field === "firstName"
                              ? "border-[#c07a50]"
                              : "border-brown-dark/15"
                          }`}
                          placeholder={t.leadForm.form.firstNamePlaceholder}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lead-last-name"
                          className="block text-brown-dark/80 font-medium mb-1.5 text-xs"
                        >
                          {t.leadForm.form.lastNamePlaceholder}
                          <span className="text-brown-dark/80">*</span>
                        </label>
                        <input
                          ref={lastNameRef}
                          id="lead-last-name"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            });
                            if (validationMessage?.field === "lastName") {
                              setValidationMessage(null);
                            }
                          }}
                          aria-invalid={validationMessage?.field === "lastName"}
                          className={`w-full px-3 py-2 border rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/85 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md ${
                            validationMessage?.field === "lastName"
                              ? "border-[#c07a50]"
                              : "border-brown-dark/15"
                          }`}
                          placeholder={t.leadForm.form.lastNamePlaceholder}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="lead-email"
                        className="block text-brown-dark/80 font-medium mb-1.5 text-xs"
                      >
                        {t.leadForm.form.emailPlaceholder}
                        <span className="text-brown-dark/80">*</span>
                      </label>
                      <input
                        ref={emailRef}
                        type="email"
                        name="email"
                        id="lead-email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (validationMessage?.field === "email") {
                            setValidationMessage(null);
                          }
                        }}
                        aria-invalid={validationMessage?.field === "email"}
                        className={`w-full px-3 py-2 border rounded-xl focus:border-gold-warm focus:ring-1 focus:ring-gold-warm/20 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-brown-dark text-sm shadow-sm hover:shadow-md ${
                          validationMessage?.field === "email"
                            ? "border-[#c07a50]"
                            : "border-brown-dark/15"
                        }`}
                        placeholder={t.leadForm.form.emailPlaceholder}
                      />
                    </div>
                    <div
                      ref={altchaRef}
                      className={`rounded-2xl border px-4 py-4 bg-white/90 backdrop-blur-sm text-[13px] text-brown-dark/90 leading-relaxed transition-all duration-200 ${
                        validationMessage?.field === "captcha"
                          ? "border-[#c07a50]"
                          : "border-brown-dark/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <p className="text-sm font-semibold text-brown-dark/90 flex items-center gap-2">
                          <Bot className="h-4 w-4 text-gold-warm" />
                          {language === "es"
                            ? "Verificación privada ALTCHA"
                            : "Private ALTCHA verification"}
                        </p>
                        <span className="text-[11px] font-semibold uppercase tracking-tight text-brown-dark/60">
                          ALTCHA
                        </span>
                      </div>
                      <div className="mt-2">
                        <altcha-widget
                          challengeurl="/api/altcha/challenge"
                          name="altcha_payload"
                          hidefooter="true"
                          hidelogo="true"
                          language={language}
                          strings={altchaStrings}
                        ></altcha-widget>
                      </div>
                      <p className="text-[11px] text-brown-dark/60 mt-2">
                        {language === "es"
                          ? "ALTCHA funciona en tu navegador y se regenera cada vez que solicitas el dossier. No rastrea ni muestra logotipos externos."
                          : "ALTCHA runs in your browser and regenerates for every dossier request. No tracking, no external badges."}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-3 bg-white/80 backdrop-blur-sm text-[13px] text-brown-dark/90 leading-relaxed transition-all duration-200 ${
                        validationMessage?.field === "privacy"
                          ? "border-[#c07a50]"
                          : "border-brown-dark/20"
                      }`}
                    >
                      <label
                        htmlFor="lead-privacy"
                        className="flex items-start gap-3 cursor-pointer"
                      >
                        <input
                          ref={privacyRef}
                          id="lead-privacy"
                          name="privacy"
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => {
                            setPrivacyAccepted(e.target.checked);
                            if (validationMessage?.field === "privacy") {
                              setValidationMessage(null);
                            }
                          }}
                          aria-invalid={validationMessage?.field === "privacy"}
                          className="mt-1 h-4 w-4 rounded border-brown-dark/30 text-gold-warm focus:ring-gold-warm/40"
                        />
                        <span>{privacyCheckboxLabel}</span>
                      </label>
                    </div>

                    <div className="flex justify-center mt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-linear-to-r from-[#8a7a4f] to-[#9a8a60] hover:from-[#9a8a60] hover:to-[#8a7a4f] text-[#1f1509] font-semibold py-2 px-6 rounded-xl shadow-[0_4px_16px_rgba(162,144,96,0.4)] hover:shadow-[0_6px_20px_rgba(162,144,96,0.5)] transition-all duration-300 text-sm disabled:cursor-not-allowed disabled:opacity-70 relative overflow-hidden group"
                      >
                        <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                        <span className="relative flex items-center justify-center">
                          <Download
                            className={`mr-2 h-4 w-4 ${
                              isSubmitting ? "animate-pulse" : ""
                            }`}
                          />
                          {isSubmitting
                            ? t.leadForm.form.sending
                            : t.leadForm.form.ctaButton}
                        </span>
                      </Button>
                    </div>

                    {automationFeedback && (
                      <div
                        className={`text-xs rounded-xl border px-3 py-2 text-left ${
                          automationFeedback.type === "success"
                            ? "border-brown-dark/20 text-[#5a4f3d] bg-[#ddd4c6]"
                            : "border-red-400 text-red-600 bg-red-50"
                        }`}
                      >
                        {automationFeedback.type === "success"
                          ? t.leadForm.form.successMessage.replace(
                              "{{name}}",
                              automationFeedback.userName
                            )
                          : t.leadForm.form.errorMessage}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PIE DE PÁGINA: FOOTER ==================== */}
      {/* Anclora Private Estates Section */}
      <section
        id="anclora"
        ref={footerRef}
        className="relative py-16 md:py-20 bg-[#f8f5f0]"
        style={{
          opacity: visibleSections.footer ? 1 : 0,
          transform: visibleSections.footer
            ? "translateY(0px)"
            : "translateY(30px)",
          transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Logo Anclora centrado */}
            <div className="flex flex-col items-center mb-4 md:mb-6 space-y-2">
              <div className="group relative inline-flex items-center justify-center px-5 md:px-6 lg:px-7 py-6 md:py-7">
                <div
                  className="pointer-events-none absolute inset-0 rounded-[26px] bg-linear-to-br from-[#fdf8ef] via-[#f4e8d5] to-[#e8dcc8] shadow-[0_20px_50px_rgba(34,24,14,0.22)] border border-[#e0d2b8]"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-6 md:-top-7 w-[82%] max-w-[420px] aspect-3/1 bg-linear-to-b from-[#f7ead3] via-[#f0e2c1] to-transparent shadow-[0_18px_34px_-18px_rgba(34,24,14,0.35)] rounded-t-[22px]"
                  style={{ clipPath: "polygon(50% 0%, 100% 100%, 0 100%)" }}
                  aria-hidden="true"
                />
                <Image
                  src="/assets/imagenes/anclora.webp"
                  alt="Anclora Private Estates"
                  width={320}
                  height={200}
                  className="relative z-10 h-40 md:h-52 lg:h-64 object-contain w-auto grayscale-group-hover transition-all duration-500 ease-out drop-shadow-2xl group-hover:-translate-y-2 group-hover:drop-shadow-[0_18px_45px_rgba(34,24,14,0.28)]"
                  sizes="(max-width: 768px) 60vw, 25vw"
                />
              </div>
            </div>

            <div className="text-center mb-4 md:mb-5">
              <h2 className="text-2xl md:text-3xl font-medium text-[#5a4f3d] tracking-[0.15em] uppercase">
                ANCLORA PRIVATE ESTATES
              </h2>
            </div>

            {/* Textos descriptivos */}
            <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
              <p className="text-sm md:text-base text-[#6E5F46] leading-relaxed">
                {language === "es"
                  ? "Anclora Private Estates es una firma boutique especializada en inversiones inmobiliarias de ultra-lujo en los mercados más exclusivos del mundo. Nos dedicamos a identificar oportunidades únicas que combinan rentabilidad excepcional con activos tangibles de primer nivel."
                  : "Anclora Private Estates is a boutique firm specializing in ultra-luxury real estate investments in the world's most exclusive markets. We are dedicated to identifying unique opportunities that combine exceptional returns with prime tangible assets."}
              </p>
              <p className="text-sm md:text-base text-[#6E5F46] leading-relaxed">
                {language === "es"
                  ? "Nuestra filosofía se centra en ofrecer acceso privilegiado a desarrollos premium antes de que lleguen al mercado general, permitiendo a nuestros clientes posicionarse estratégicamente en ubicaciones de alto crecimiento."
                  : "Our philosophy focuses on providing privileged access to premium developments before they reach the general market, enabling our clients to strategically position themselves in high-growth locations."}
              </p>
            </div>

            {/* Franja con principios de la firma */}
            <div className="bg-[#e8dcc8] py-10 md:py-12 px-6 md:px-8 rounded-2xl">
              {/* Tagline */}
              <div className="text-center mb-10 md:mb-12">
                <h3 className="text-xl md:text-2xl font-light text-[#271c13] tracking-wide uppercase">
                  {language === "es" ? "Nuestros Principios" : "Our Principles"}
                </h3>
              </div>

              {/* Principios */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
                <div className="text-center">
                  <p className="text-lg md:text-xl font-medium text-[#A29060] mb-2 uppercase tracking-wide">
                    {language === "es" ? "Exclusividad" : "Exclusivity"}
                  </p>
                  <p className="text-xs md:text-sm text-[#6E5F46] leading-relaxed">
                    {language === "es"
                      ? "Acceso a oportunidades selectas"
                      : "Access to select opportunities"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-medium text-[#A29060] mb-2 uppercase tracking-wide">
                    {language === "es" ? "Transparencia" : "Transparency"}
                  </p>
                  <p className="text-xs md:text-sm text-[#6E5F46] leading-relaxed">
                    {language === "es"
                      ? "Claridad en cada operación"
                      : "Clarity in every transaction"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-medium text-[#A29060] mb-2 uppercase tracking-wide">
                    {language === "es" ? "Visión" : "Vision"}
                  </p>
                  <p className="text-xs md:text-sm text-[#6E5F46] leading-relaxed">
                    {language === "es"
                      ? "Anticipación a mercados emergentes"
                      : "Anticipating emerging markets"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-xl font-medium text-[#A29060] mb-2 uppercase tracking-wide">
                    {language === "es" ? "Compromiso" : "Commitment"}
                  </p>
                  <p className="text-xs md:text-sm text-[#6E5F46] leading-relaxed">
                    {language === "es"
                      ? "Acompañamiento personalizado"
                      : "Personalized guidance"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
