interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Axsis V2</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="primary-button" type="button" disabled>
          ستُفعّل في المرحلة القادمة
        </button>
      </header>

      <div className="foundation-grid">
        <article className="foundation-card foundation-card-accent">
          <span>الهيكل</span>
          <strong>React + TypeScript</strong>
          <p>كل قسم أصبح مسارًا مستقلًا بدل بقائه داخل ملف واحد.</p>
        </article>
        <article className="foundation-card">
          <span>الواجهة</span>
          <strong>Responsive موحدة</strong>
          <p>المكونات نفسها تعمل على الهاتف والكمبيوتر مع اختلاف الترتيب فقط.</p>
        </article>
        <article className="foundation-card">
          <span>الهوية</span>
          <strong>Design System واحد</strong>
          <p>ألوان هادئة وتسلسل بصري واضح دون ثيمات متضاربة.</p>
        </article>
      </div>

      <div className="empty-panel">
        <div className="empty-icon">✓</div>
        <div>
          <h2>تم تجهيز مكان هذا القسم</h2>
          <p>سننقل الوظائف إليه تدريجيًا بعد اكتمال قاعدة البيانات المحلية والمكونات الأساسية.</p>
        </div>
      </div>
    </section>
  )
}
