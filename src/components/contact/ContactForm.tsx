import { useState } from 'react'
import styles from './ContactForm.module.css'

interface ContactFormProps {
  onClose: () => void
}

// Lista de palavrões em pt-BR, para evitar mensagens de baixo nivel
const PROFANITY = [
  'arrombado', 'babaca', 'bicha', 'boquete', 'bosta', 'buceta',
  'cabaço', 'cabaco', 'cacete', 'canalha', 'caralho', 'corno', 'cu',
  'desgraça', 'escroto', 'fdp', 'filho da puta', 'foda', 'foda-se', 'fodase',
  'idiota', 'imbecil', 'inferno', 'krl', 'lixo', 'macaco', 'merda', 'mongol',
  'otario', 'otário', 'pica', 'pika', 'piroca', 'pnc', 'porra', 'pqp', 'punheta',
  'puta', 'putaria', 'rapariga', 'retardado', 'rola', 'sapatao', 'sapatão', 'sifude',
  'siririca', 'tnc', 'tomanocu', 'traveco', 'vadia', 'vai se foder', 'viadinho',
  'viado', 'vsf', 'vtc', 'vtnc', 'xoxota'
];

function containsProfanity(text: string): boolean {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return PROFANITY.some(word => {
    const w = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return new RegExp(`\\b${w}\\b`).test(normalized)
  })
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidPhone(value: string): boolean {
  // Aceita: (99)99999-9999 | (99)9999-9999 | com ou sem espaços/traços
  return /^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/.test(value.trim())
}

function isValidContact(value: string): boolean {
  return isValidEmail(value) || isValidPhone(value)
}

interface FieldErrors {
  name?: string
  contact?: string
  message?: string
}

export default function ContactForm({ onClose }: ContactFormProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const TEAM_EMAIL = 'equipe.aguaai@outlook.com' 

  function validate(): FieldErrors {
    const e: FieldErrors = {}

    if (!name.trim()) {
      e.name = 'Informe seu nome ou nick.'
    } else if (containsProfanity(name)) {
      e.name = 'Por favor, use um nome adequado.'
    }

    if (!contact.trim()) {
      e.contact = 'Informe um email ou telefone.'
    } else if (!isValidContact(contact)) {
      e.contact = 'Use um email válido (ex: nome@email.com) ou telefone (ex: (99)99999-9999).'
    }

    if (!message.trim()) {
      e.message = 'Escreva sua mensagem.'
    } else if (containsProfanity(message)) {
      e.message = 'Por favor, mantenha a mensagem respeitosa.'
    } else if (message.trim().length < 10) {
      e.message = 'Mensagem muito curta. Descreva melhor como podemos ajudar.'
    }

    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const body = `Olá,\n\nNome / Nick: ${name}\nContato: ${contact}\n\nMensagem:\n${message}\n\n---\nEnviado via Fale Conosco`
    const subject = `Fale Conosco — ${name}`

    window.open(
      `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    )

    setSubmitted(true)
    setName('')
    setContact('')
    setMessage('')
    setErrors({})
  }

  // Valida campo individualmente ao sair (onBlur)
  const handleBlur = (field: keyof FieldErrors) => {
    const e = validate()
    setErrors(prev => ({ ...prev, [field]: e[field] }))
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Fale conosco</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.successState}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M8 12.5l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>Seu cliente de email foi aberto com a mensagem preenchida. É só enviar!</p>
          <button className={styles.resetBtn} onClick={() => setSubmitted(false)}>
            Enviar outra mensagem
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Fale conosco</h3>
          <p className={styles.subtitle}>Responderemos pelo contato informado.</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">Nome ou nick</label>
          <input
            id="cf-name"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            type="text"
            placeholder="Como prefere ser chamado"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => handleBlur('name')}
          />
          {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-contact">Contato</label>
          <input
            id="cf-contact"
            className={`${styles.input} ${errors.contact ? styles.inputError : ''}`}
            type="text"
            placeholder="email@email.com ou (99)99999-9999"
            value={contact}
            onChange={e => setContact(e.target.value)}
            onBlur={() => handleBlur('contact')}
          />
          {errors.contact && <span className={styles.errorMsg}>{errors.contact}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-message">Mensagem</label>
          <textarea
            id="cf-message"
            className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
            placeholder="Como podemos ajudar?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onBlur={() => handleBlur('message')}
            rows={4}
          />
          {errors.message && <span className={styles.errorMsg}>{errors.message}</span>}
        </div>

        <button className={styles.submitBtn} onClick={handleSubmit}>
          Abrir no email
        </button>
      </div>
    </div>
  )
}
