/** Two-way concept illustration: Deaf user with glove ⇄ phone ⇄ hearing user. Flat, calm, on-brand. */
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 640 440" className="hero-svg" role="img" aria-label="A Deaf person wearing the smart glove signs; the phone turns it into speech for a hearing person, and turns the hearing person's speech into text or sign for the Deaf person.">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9" fill="none" stroke="#0B7F7B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <rect x="0" y="0" width="640" height="440" rx="20" fill="#EAF3F4" />

      {/* Deaf person */}
      <g>
        <circle cx="112" cy="168" r="34" fill="#9A6240" />
        <path d="M78 160 Q78 126 112 126 Q146 126 146 160 Q132 146 112 146 Q92 146 78 160Z" fill="#171717" />
        <path d="M56 330 V252 Q56 212 112 206 Q168 212 168 252 V330 Z" fill="#0B1F3A" />
        {/* arm raised with glove */}
        <path d="M150 232 Q196 244 196 196" fill="none" stroke="#0B1F3A" strokeWidth="24" strokeLinecap="round" />
        <rect x="182" y="150" width="30" height="40" rx="12" fill="#274B76" />
        <rect x="185" y="140" width="6" height="22" rx="3" fill="#274B76" />
        <rect x="193" y="136" width="6" height="26" rx="3" fill="#274B76" />
        <rect x="201" y="140" width="6" height="22" rx="3" fill="#274B76" />
        <rect x="196" y="168" width="8" height="8" rx="2" fill="#2DD4BF" />
        <circle cx="196" cy="196" r="5" fill="#2DD4BF" />
        <text x="112" y="362" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0B1F3A" fontFamily="Inter Variable, Inter, sans-serif">Deaf NSL user</text>
        <text x="112" y="381" textAnchor="middle" fontSize="12" fill="#52607A" fontFamily="Inter Variable, Inter, sans-serif">wears the smart glove</text>
      </g>

      {/* Phone */}
      <g>
        <rect x="246" y="64" width="148" height="296" rx="24" fill="#0B1F3A" />
        <rect x="256" y="84" width="128" height="256" rx="14" fill="#F6F7F9" />
        <rect x="294" y="71" width="52" height="6" rx="3" fill="#274B76" />
        {/* messages */}
        <rect x="266" y="104" width="88" height="40" rx="10" fill="#fff" stroke="#D5DCE5" />
        <text x="276" y="122" fontSize="10" fill="#52607A" fontFamily="Inter Variable, Inter, sans-serif">Hearing</text>
        <text x="276" y="136" fontSize="12" fontWeight="600" fill="#0B1F3A" fontFamily="Inter Variable, Inter, sans-serif">Good morning</text>
        <rect x="286" y="158" width="88" height="40" rx="10" fill="#0B7F7B" />
        <text x="296" y="176" fontSize="10" fill="#CDEFEE" fontFamily="Inter Variable, Inter, sans-serif">Glove → speech</text>
        <text x="296" y="190" fontSize="12" fontWeight="600" fill="#fff" fontFamily="Inter Variable, Inter, sans-serif">I am fine</text>
        {/* avatar chip */}
        <rect x="266" y="214" width="108" height="86" rx="10" fill="#E6F6F5" />
        <circle cx="320" cy="244" r="12" fill="#9A6240" />
        <path d="M296 290 V274 Q296 262 320 260 Q344 262 344 274 V290Z" fill="#0B1F3A" />
        <path d="M344 270 L358 250" stroke="#0B1F3A" strokeWidth="7" strokeLinecap="round" />
        <circle cx="360" cy="246" r="5" fill="#9A6240" />
        <rect x="266" y="310" width="108" height="20" rx="10" fill="#0B1F3A" />
        <text x="320" y="324" textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff" fontFamily="Inter Variable, Inter, sans-serif">Text or Sign Mode</text>
        <text x="320" y="381" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0B1F3A" fontFamily="Inter Variable, Inter, sans-serif">SIGNBRIDGE app</text>
        <text x="320" y="400" textAnchor="middle" fontSize="12" fill="#52607A" fontFamily="Inter Variable, Inter, sans-serif">Phase One demo</text>
      </g>

      {/* Hearing person */}
      <g>
        <circle cx="528" cy="168" r="34" fill="#C58B62" />
        <path d="M494 160 Q494 128 528 128 Q562 128 562 160 Q548 148 528 148 Q508 148 494 160Z" fill="#2A1A12" />
        <path d="M472 330 V252 Q472 212 528 206 Q584 212 584 252 V330 Z" fill="#52607A" />
        <path d="M512 182 Q528 192 544 182" fill="none" stroke="#5B2F1A" strokeWidth="3" strokeLinecap="round" />
        <text x="528" y="362" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0B1F3A" fontFamily="Inter Variable, Inter, sans-serif">Hearing person</text>
        <text x="528" y="381" textAnchor="middle" fontSize="12" fill="#52607A" fontFamily="Inter Variable, Inter, sans-serif">speaks naturally</text>
      </g>

      {/* flows */}
      <path d="M214 120 C 232 108, 236 108, 244 112" fill="none" stroke="#0B7F7B" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 7" markerEnd="url(#arr)" />
      <text x="205" y="94" fontSize="11" fontWeight="700" fill="#0B7F7B" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif">SIGN → SPEECH</text>
      <path d="M396 250 C 430 250, 450 232, 470 226" fill="none" stroke="#0B7F7B" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 7" markerEnd="url(#arr)" />
      <path d="M470 200 C 450 190, 430 120, 398 112" fill="none" stroke="#0B1F3A" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 7" markerEnd="url(#arr)" />
      <text x="436" y="96" fontSize="11" fontWeight="700" fill="#0B1F3A" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif">SPEECH → TEXT / SIGN</text>
      {/* sound waves near hearing mouth */}
      <path d="M470 176 q-8 8 0 16 M460 170 q-14 14 0 28" fill="none" stroke="#0B7F7B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
