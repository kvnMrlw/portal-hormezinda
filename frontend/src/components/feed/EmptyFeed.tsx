import { MessageSquareText, Plus, Sparkles } from 'lucide-react';

export function EmptyFeed() {
  return (
    <section className="ph-empty-feed" aria-label="Feed sem publicações">
      <div className="ph-empty-illustration" aria-hidden="true">
        <span className="ph-empty-glow" />
        <span className="ph-empty-icon"><MessageSquareText /></span>
        <span className="ph-empty-spark a"><Sparkles /></span>
        <span className="ph-empty-spark b"><Plus /></span>
      </div>
      <div>
        <span className="ph-empty-kicker">Seu mural está pronto</span>
        <h2>Ainda não há publicações.</h2>
        <p>Quando a comunidade compartilhar novidades, elas aparecerão aqui em uma linha do tempo limpa e organizada.</p>
      </div>
    </section>
  );
}
