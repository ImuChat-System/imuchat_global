export default function CardPreview() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '340px',
        aspectRatio: '16/9',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #064e3b 60%, #059669 100%)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(5,150,105,0.3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0 auto',
      }}
    >
      {/* Reflets */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(5,150,105,0.15)',
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(5,150,105,0.1)',
          filter: 'blur(20px)',
        }}
      />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(5,150,105,0.6)' }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>IMUPAY</span>
        </div>
        {/* Chip */}
        <div
          style={{
            width: '30px',
            height: '22px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #d4a853, #f5c869)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      </div>

      {/* Card number */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '15px',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.18em',
            fontWeight: 500,
          }}
        >
          •••• &nbsp;•••• &nbsp;•••• &nbsp;4829
        </p>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Card Holder</p>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>JEAN DUPONT</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginTop: '2px' }}>Expire 03/28</p>
        </div>
        {/* Mastercard logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '-4px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#eb001b', opacity: 0.9 }} />
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f79e1b', opacity: 0.9, marginLeft: '-8px' }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '7px', marginLeft: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>MASTERCARD</span>
        </div>
      </div>
    </div>
  );
}
