/**
 * Icones de marca (Instagram, X) em SVG inline.
 *
 * O lucide-react removeu TODOS os icones de marca na v1, por questao de
 * trademark — nao foi renomeacao, eles deixaram de existir. Como estes dois
 * apontam para os perfis do artista, ficam aqui, no mesmo formato dos demais
 * (`size` + `className`, traco em `currentColor`) para trocar um pelo outro
 * sem mexer em quem usa.
 *
 * O Discord ja seguia este caminho, inline dentro do Footer; agora os tres
 * moram no mesmo lugar.
 */

interface BrandIconProps {
  size?: number;
  className?: string;
}

export function InstagramIcon({ size = 16, className }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/** Glifo oficial do X. Preenchido, como o do Discord — marca nao tem versao de traco. */
export function XIcon({ size = 16, className }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function DiscordIcon({ size = 16, className }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,.48,80.21h0A105.73,105.73,0,0,0,32.47,96.36,77.7,77.7,0,0,0,39.2,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.73,11.1,105.32,105.32,0,0,0,32.05-16.14h0C129.58,52.84,121.21,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.07,65.69,84.69,65.69Z" />
    </svg>
  );
}
