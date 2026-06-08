/* Pages Institution CTD
   - Présentation officielle
   - Mot du Président
   - Missions & Attributions (9 missions)
   - Structure organisationnelle
   - Historique */

import React from 'react';
import { MISSIONS_CTD, DIRECTIONS } from './data';
import { getPageContent, getSettings, useApi } from './api';
import { Icon } from './icons';

/* ─── Bannière de page commune ──────────────────────────── */
function PageBanner({ go, title, lead }) {
  return (
    <section className="page-banner" style={{paddingBottom: 40}}>
      <div className="container">
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRÉSENTATION OFFICIELLE CTD
   ═══════════════════════════════════════════════════════════ */
export function PresentationPage({ go }) {
  const { data: page } = useApi(() => getPageContent('institution-presentation'), []);
  const banner = page?.sections?.banner || {
    title: "Présentation de la CTD",
    lead: "La Commission Technique du Désengagement, structure pivot de la modernisation économique du secteur public."
  };
  const content = page?.sections?.content || `
    <p class="justify" style="margin-bottom:16px;">La <strong>Commission Technique du Désengagement (CTD)</strong> de la République du Tchad est la structure chargée d'accompagner et de piloter le processus de désengagement de l'État du capital des entreprises publiques et parapubliques.</p>
    <p class="justify" style="margin-bottom:16px;">Elle joue un rôle stratégique dans la mise en œuvre des politiques de privatisation, de restructuration et de partenariat avec le secteur privé.</p>
    <p class="justify" style="margin-bottom:24px;">La CTD veille à garantir la <strong>transparence</strong>, l'<strong>efficacité</strong> et l'<strong>équité</strong> des opérations de cession, tout en contribuant à l'amélioration de la performance économique des entreprises concernées.</p>
  `;

  return (
    <main id="main" className="page-enter">
      <PageBanner
        go={go}
        title={banner.title}
        lead={banner.lead}
      />
      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div style={{
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start'
        }} className="pres-grid">
          <div>
            <div className="eyebrow">Qui sommes-nous</div>
            <h2 style={{fontSize:'var(--fs-xl)', margin:'12px 0 24px'}}>
              Au cœur de la transformation économique du Tchad
            </h2>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:8}}>
              <button className="btn btn-primary" onClick={() => go('institution-missions')}>
                Nos missions <Icon.arrowRight />
              </button>
              <button className="btn btn-ghost" onClick={() => go('institution-structure')}>
                Notre organisation
              </button>
            </div>
          </div>
          <div>
            {/* Blocs clés */}
            {[
              { ic: '🎯', title: 'Mandat officiel', text: 'La CTD a été créée par décret présidentiel dans le cadre des réformes économiques visant à moderniser le secteur public et à renforcer le rôle du secteur privé.' },
              { ic: '⚖️', title: 'Garanties légales', text: 'Toutes les opérations de désengagement sont encadrées par la Loi portant cadre général du désengagement de l\'État, garantissant leur légalité et leur transparence.' },
              { ic: '🤝', title: 'Partenariats internationaux', text: 'La CTD coopère avec la Banque Mondiale, la BAD, l\'IFC et l\'AFD pour renforcer ses capacités institutionnelles et mobiliser des investissements.' },
            ].map((b, i) => (
              <div key={i} style={{
                background:'var(--paper)', border:'1px solid var(--rule)',
                borderRadius:'var(--radius-lg)', padding:'20px 24px',
                marginBottom:16, display:'flex', gap:16, alignItems:'flex-start'
              }}>
                <span style={{fontSize:28, lineHeight:1}}>{b.ic}</span>
                <div>
                  <h4 style={{fontSize:'var(--fs-base)', color:'var(--navy)', margin:'0 0 6px'}}>{b.title}</h4>
                  <p style={{fontSize:'var(--fs-sm)', color:'var(--ink-soft)', margin:0, lineHeight:1.55}}>{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOT DU PRÉSIDENT
   ═══════════════════════════════════════════════════════════ */
export function MotPresidentPage({ go }) {
  return (
    <main id="main" className="page-enter">
      <PageBanner
        go={go}
        
        title="Mot du Président"
        lead="Message officiel du Président de la Commission Technique du Désengagement adressé aux investisseurs, partenaires et à l'ensemble des parties prenantes."
        
      />
      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div style={{
          background: 'var(--paper)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 56px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 48,
          alignItems: 'start',
        }} className="mot-card">
          <div>
            <div style={{
              width: 220, height: 280,
              background: 'linear-gradient(135deg, #1B3D7C, #0E2A5E)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid var(--rule)',
            }}>
              <span style={{
                position:'absolute', inset:0, display:'flex',
                alignItems:'center', justifyContent:'center',
                fontFamily:'var(--mono)', fontSize:11, color:'rgba(255,255,255,0.4)',
                letterSpacing:'0.14em', textTransform:'uppercase', textAlign:'center', padding:20
              }}>[ portrait officiel<br/>à préciser ]</span>
            </div>
            <div style={{marginTop:16}}>
              <div style={{fontFamily:'var(--serif)', fontSize:'var(--fs-lg)', color:'var(--navy)', fontWeight:600}}>
                S.E.M. [Nom Prénom]
              </div>
              <div style={{fontSize:'var(--fs-sm)', color:'var(--ink-mute)', marginTop:4}}>
                Président de la Commission
              </div>
              <div style={{fontSize:'var(--fs-sm)', color:'var(--ink-mute)', marginTop:2}}>
                Commission Technique du Désengagement
              </div>
            </div>
          </div>
          <div>
            <div style={{fontSize:'var(--fs-xs)', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--red)', fontWeight:700, marginBottom:14}}>
              Allocution officielle
            </div>
            <p className="justify" style={{fontFamily:'var(--serif)', fontSize:'var(--fs-md)', fontStyle:'italic', color:'var(--ink-soft)', lineHeight:1.7, margin:'0 0 24px'}}>
              « La Commission Technique du Désengagement œuvre pour une transformation structurelle de l'économie tchadienne en favorisant une participation accrue du secteur privé. »
            </p>
            <p className="justify" style={{margin:'0 0 16px'}}>
              À travers ce portail, nous affirmons notre engagement pour la <strong style={{color:'var(--navy)'}}>transparence</strong>, la <strong style={{color:'var(--navy)'}}>bonne gouvernance</strong> et l'<strong style={{color:'var(--navy)'}}>attractivité économique</strong> du Tchad.
            </p>
            <p className="justify" style={{margin:'0 0 16px'}}>
              Nous invitons les investisseurs et partenaires à découvrir les opportunités offertes par le processus de désengagement et à participer activement à cette dynamique de modernisation de notre économie nationale.
            </p>
            <p className="justify" style={{margin:'0 0 24px'}}>
              La CTD s'engage à mener chaque opération avec rigueur, équité et dans le strict respect des procédures internationales, afin de garantir la confiance de tous les acteurs impliqués.
            </p>
            <div style={{marginTop:24, paddingTop:24, borderTop:'1px solid var(--rule-soft)', display:'flex', gap:12, flexWrap:'wrap'}}>
              <button className="btn btn-outline" onClick={() => go('investisseurs')}>
                <Icon.arrowRight /> Voir les opportunités
              </button>
              <button className="btn btn-ghost" onClick={() => go('contact')}>
                Contacter la Commission
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   MISSIONS & ATTRIBUTIONS (9 missions CTD)
   ═══════════════════════════════════════════════════════════ */
export function MissionsPage({ go }) {
  const { data: page } = useApi(() => getPageContent('institution-missions'), []);
  const { data: settingsData } = useApi(() => getSettings(), []);
  const banner = page?.sections?.banner || {
    title: "Missions & Attributions",
    lead: "Neuf grandes missions structurent l'action de la Commission Technique du Désengagement au service de la modernisation économique du Tchad."
  };
  let missions = page?.sections?.missions || MISSIONS_CTD;
  if (settingsData?.missions) {
    try {
      const parsed = typeof settingsData.missions === 'string' ? JSON.parse(settingsData.missions) : settingsData.missions;
      if (Array.isArray(parsed) && parsed.length > 0) missions = parsed;
    } catch { }
  }

  return (
    <main id="main" className="page-enter">
      <PageBanner
        go={go}
        title={banner.title}
        lead={banner.lead}
      />
      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div className="svc-grid">
          {missions.map((m, idx) => (
            <article key={m.title || idx} className="svc-card">
              <span className="num">{(idx + 1).toString().padStart(2, '0')} / {missions.length.toString().padStart(2, '0')}</span>
              <h3>{m.title}</h3>
              <p className="justify">{m.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   STRUCTURE ORGANISATIONNELLE CTD
   ═══════════════════════════════════════════════════════════ */
export function StructurePage({ go }) {
  const [selected, setSelected] = React.useState(null);

  // Charger les organismes depuis la nouvelle API
  const { data: treeData, isLoading } = useApi(() => 
    fetch('/api/organismes/tree').then(res => res.json())
  , []);

  const openModal = (dir) => setSelected(dir);
  const closeModal = () => setSelected(null);

  // Fonction récursive pour afficher l'arbre
  const renderTree = (nodes) => {
    if (!nodes || nodes.length === 0) return null;
    return (
      <div className="org-tree-level">
        {nodes.map(node => (
          <div key={node.id} className="org-tree-branch">
            <div className="org-node"
                 role="button" tabIndex={0}
                 onClick={() => openModal(node)}
                 onKeyDown={e => e.key === 'Enter' && openModal(node)}>
              <div className="org-name">{node.name}</div>
              <div className="org-node-click-hint">Cliquer pour détails</div>
            </div>
            {node.children && node.children.length > 0 && (
              <div className="org-tree-children">
                {renderTree(node.children)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <main id="main" className="page-enter">
      <PageBanner
        go={go}
        title="Organisation de la CTD"
        lead="Structure institutionnelle de la Commission. Cliquez sur une direction pour en savoir plus."
      />
      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        {isLoading ? (
          <div style={{textAlign: 'center', padding: '40px', color: 'var(--ink-mute)'}}>Chargement de l'organigramme...</div>
        ) : (
          <div className="orgchart-interactive">
            {treeData && treeData.length > 0 ? (
              <div className="orgchart-wrapper">
                {renderTree(treeData)}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '40px', color: 'var(--ink-mute)'}}>Aucun organisme défini pour le moment. L'arbre apparaîtra ici une fois configuré.</div>
            )}
          </div>
        )}
      </section>

      {/* Modal popup */}
      {selected && (
        <div className="org-modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-name">
          <div className="org-modal" onClick={e => e.stopPropagation()}>
            <button className="org-modal-close" onClick={closeModal} aria-label="Fermer">✕</button>
            <h2 className="org-modal-name" id="modal-name" style={{ marginBottom: '16px' }}>{selected.name}</h2>
            {selected.description ? (
              <p className="org-modal-desc">{selected.description}</p>
            ) : (
              <p className="org-modal-desc" style={{fontStyle:'italic', opacity:0.5}}>Aucune description disponible pour cet organisme.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORIQUE CTD
   ═══════════════════════════════════════════════════════════ */
export function HistoriquePage({ go }) {
  const { data: page } = useApi(() => getPageContent('institution-historique'), []);
  const banner = page?.sections?.banner || {
    title: "Historique de la CTD",
    lead: "Depuis sa création, la Commission Technique du Désengagement a contribué à plusieurs opérations de restructuration et de désengagement, renforçant la compétitivité des secteurs concernés."
  };
  
  const events = page?.sections?.timeline || [
    { year: '2000s', title: 'Contexte des réformes économiques', desc: 'Le Tchad s\'engage dans un vaste programme de réformes structurelles visant à moderniser le secteur public et à améliorer le climat des affaires, dans le cadre des recommandations des institutions financières internationales.' },
    { year: '2010s', title: 'Création de la CTD', desc: 'La Commission Technique du Désengagement est mise en place par décret présidentiel dans le cadre de la politique de libéralisation économique. Elle est chargée de piloter le processus de privatisation des entreprises publiques.' },
    { year: '2015–2020', title: 'Premières opérations de désengagement', desc: 'La CTD conduit ses premières opérations de cession et de restructuration, contribuant à renforcer la compétitivité de plusieurs secteurs économiques stratégiques.' },
    { year: '2021–2024', title: 'Modernisation et renforcement institutionnel', desc: 'Renforcement des capacités institutionnelles de la Commission grâce à des partenariats avec la BAD et la Banque Mondiale. Mise en place de nouvelles procédures de transparence conformes aux standards internationaux.' },
    { year: '2025–2026', title: 'Accélération du programme de désengagement', desc: 'Lancement d\'un programme accéléré d\'opérations de cession dans les secteurs des télécommunications, du transport et de l\'agro-industrie. Ouverture du portail numérique pour faciliter l\'accès des investisseurs.' },
  ];

  return (
    <main id="main" className="page-enter">
      <PageBanner
        go={go}
        title={banner.title}
        lead={banner.lead}
      />
      <section className="container" style={{paddingTop: 48, paddingBottom: 80}}>
        <div className="timeline" role="list">
          {events.map((ev, i) => (
            <div key={i} className="step done" role="listitem" style={{paddingBottom:32}}>
              <div className="dot" style={{background:'var(--gold)', color:'white', fontFamily:'var(--sans)', fontSize:10, fontWeight:800, letterSpacing:'0.04em'}}>
                ✓
              </div>
              <div className="body">
                <div style={{fontSize:'var(--fs-xs)', color:'var(--gold)', fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:6}}>{ev.year}</div>
                <h4>{ev.title}</h4>
                <p className="justify">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          background:'var(--cream-warm)', border:'1px solid var(--rule)',
          borderRadius:'var(--radius-lg)', padding:'28px 32px',
          marginTop:32, borderLeft:'4px solid var(--gold)'
        }}>
          <div className="eyebrow" style={{marginBottom:8}}>Note importante</div>
          <p style={{margin:0, fontSize:'var(--fs-sm)', color:'var(--ink-soft)', lineHeight:1.65}}>
            Les informations présentées dans cet historique constituent une base de travail. Les dates précises et les événements spécifiques seront validés et enrichis par les autorités compétentes de la CTD avant la mise en ligne officielle du portail.
          </p>
        </div>
      </section>
    </main>
  );
}
