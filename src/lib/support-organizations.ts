export type SupportOrganization = {
  name: string;
  website: string;
  logo: string;
  darkLogo?: boolean;
  cropLogo?: boolean;
};

export const SUPPORT_ECOSYSTEM_ID = "incubadoras-aceleradoras-uruguay";

export const SUPPORT_ECOSYSTEM_TITLE =
  "Incubadoras y centros de apoyo";

export const SUPPORT_ECOSYSTEM_DESCRIPTION =
  "Uruguay cuenta con una red diversa de agencias públicas, incubadoras, aceleradoras, universidades y organizaciones privadas que acompañan ideas, impulsan la innovación y ayudan a crecer a nuevos emprendimientos y startups.";

export const SUPPORT_ORGANIZATIONS: readonly SupportOrganization[] = [
  {
    name: "ANDE",
    website: "https://ande.org.uy/emprendimientos.html",
    logo: "/supporters/ande.png",
  },
  {
    name: "ANII",
    website: "https://anii.org.uy/apoyos/emprendimientos/",
    logo: "/supporters/anii.png",
  },
  {
    name: "Uruguay Emprendedor",
    website: "https://www.uruguayemprendedor.uy/",
    logo: "/supporters/uruemp.png",
  },
  {
    name: "Ingenio",
    website: "https://ingenio.org.uy/",
    logo: "/supporters/ingenio.svg",
  },
  {
    name: "CIE ORT",
    website: "https://cie.ort.edu.uy/",
    logo: "/supporters/cie-ort.webp",
  },
  {
    name: "Ithaka UCU",
    website: "https://www.ucu.edu.uy/categoria/Ithaka-340",
    logo: "/supporters/ithaka-ucu1.png",
    darkLogo: true,
  },
  {
    name: "Initium",
    website: "https://www.um.edu.uy/initium",
    logo: "/supporters/initium.png",
  },
  {
    name: "Endeavor Uruguay",
    website: "https://uruguay.endeavor.org/",
    logo: "/supporters/endeavor.svg",
  },
  {
    name: "ThalesLab",
    website: "https://thaleslab.com/",
    logo: "/supporters/thaleslab.png",
  },
  {
    name: "Khem",
    website: "https://www.khem.org.uy/",
    logo: "/supporters/khemr.png",
    cropLogo: true,
  },
  {
    name: "LAB+",
    website: "https://labplus.uy/es/",
    logo: "/supporters/labplus.png",
  },
  {
    name: "CUTI",
    website: "https://cuti.org.uy/",
    logo: "/supporters/cuti.svg",
  },
];
