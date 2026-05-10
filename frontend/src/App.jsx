import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const apiBaseUrl = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  : ''
const LANGUAGE_STORAGE_KEY = '1win-signals-language'
const LANGUAGE_COOKIE_KEY = '1win-signals-language'
const PLAYER_ID_STORAGE_KEY = '1win-signals-player-id'
const SIGNAL_COUNT_STORAGE_KEY = '1win-signals-total-clicks'
const DEFAULT_LANGUAGE = 'en'
const PROMO_CODE = 'BSTOP'
const MODAL_ANIMATION_MS = 220
const PENALTY_ROWS = 3
const PENALTY_COLUMNS = 5
const PENALTY_CELLS = PENALTY_ROWS * PENALTY_COLUMNS
const KENO_GRID_CELLS = 40
const KENO_MODES = [
  { id: 'low', label: 'LOW', min: 2, max: 10 },
  { id: 'classic', label: 'CLASSIC', min: 2, max: 10 },
  { id: 'medium', label: 'MEDIUM', min: 2, max: 10 },
  { id: 'high', label: 'HIGH', min: 2, max: 10 },
]
const MINES_GRID_CELLS = 25
const MINES_OPTIONS = [2, 3, 5, 7]
const MINES_REVEAL_WEIGHTS = [3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 9, 10]

const LANGUAGE_OPTIONS = [
  { code: 'ru', badge: 'RU', label: 'РУССКИЙ' },
  { code: 'en', badge: 'EN', label: 'ENGLISH' },
]

const GAME_CARDS = [
  { id: 'penalty', titleKey: 'penaltyTitle', image: '/games/penalty.avif' },
  { id: 'keno', titleKey: 'kenoTitle', image: '/games/keno.avif' },
  { id: 'mines', titleKey: 'minesTitle', image: '/games/mines2.avif' },
  { id: 'coinflip', titleKey: 'coinFlipTitle', image: '/games/coinflip.avif' },
]

const COIN_SIDES = {
  heads: {
    label: 'HEADS!',
    image: '/games/coin-gold.png',
  },
  tails: {
    label: 'TAILS!',
    image: '/games/coin-silver.png',
  },
}

const COPY = {
  en: {
    documentTitle: '1WIN Signals',
    importantTitle: 'IMPORTANT!',
    mustReadTitle: '! MUST READ !',
    expandLabel: 'EXPAND',
    collapseLabel: 'COLLAPSE',
    introLines: [
      'The bot uses automated signal analysis.',
      'Access to signals depends on registration with the required promo code.',
    ],
    profitTitle: 'For maximum profit:',
    steps: [
      {
        title: '1. Register at 1WIN',
        lines: ['MUST create a NEW account', `ENTER PROMO CODE ${PROMO_CODE}`],
      },
      {
        title: '2. Connect your account',
        lines: ['Connect your account in the Profile section.'],
      },
      {
        title: '3. Get signals',
        lines: ['Request a signal and follow the instruction shown in the bot.'],
      },
    ],
    warningPrefix: 'If the account is not registered with this promo code,',
    warningStrong: 'signals may be unavailable.',
    registrationButton: 'REGISTRATION',
    promoCode: PROMO_CODE,
    registrationAlert: 'Add your 1WIN registration URL to make this button open the signup page.',
    copiedToast: 'Copied',
    readCheckboxLabel: 'I have read the instructions',
    checkboxLabel: 'I registered via link and entered promo code',
    continueButton: 'CONTINUE',
    loginTitle: 'Enter your id',
    loginLabel: 'Enter your id',
    loginPlaceholder: 'Write your ID',
    helpTitle: 'Where to find my Id?',
    helpLines: [
      '1. Open the 1win app and click the menu button.',
      'On phone: your id is displayed at the top left under account name.',
      'On computer: click the profile icon at the top left, the id will be under name.',
    ],
    loginButton: 'LOGIN',
    submitToast: 'Saved',
    online: 'Online',
    signals: 'SIGNALS',
    status: 'STATUS',
    games: 'GAMES',
    profile: 'PROFILE',
    help: 'HELP',
    change: 'CHANGE',
    gamesTitle: 'Games',
    gamesCopy: 'Signals and game-specific content will appear here.',
    kenoTitle: 'KENO',
    minesTitle: 'MINES',
    penaltyTitle: 'PENALTY',
    coinFlipTitle: 'COIN FLIP',
    getSignalButton: 'GET SIGNAL',
    loadingButton: 'LOADING...',
    menuButton: 'Menu',
    comingSoonToast: 'Coming soon',
    helpScreenTitle: 'Help',
    helpScreenCopy: 'Use the profile tab to review your Telegram profile and linked 1WIN ID.',
    idLabel: 'ID:',
    languageLabel: 'LANG:',
    languageEnglish: 'English',
    languageRussian: 'Russian',
    signalBadge: '● SIGNAL',
  },
  ru: {
    documentTitle: '1WIN Signals',
    importantTitle: 'ВАЖНО!',
    mustReadTitle: '! ОБЯЗАТЕЛЬНО ПРОЧИТАЙ !',
    expandLabel: 'ОТКРЫТЬ',
    collapseLabel: 'СКРЫТЬ',
    introLines: [
      'Бот использует автоматический анализ сигналов.',
      'Доступ к сигналам зависит от регистрации с обязательным промокодом.',
    ],
    profitTitle: 'Для максимальной прибыли:',
    steps: [
      {
        title: '1. Зарегистрируйся в 1WIN',
        lines: ['ОБЯЗАТЕЛЬНО создай НОВЫЙ аккаунт', `ВВЕДИ ПРОМОКОД ${PROMO_CODE}`],
      },
      {
        title: '2. Подключи аккаунт',
        lines: ['Подключи свой аккаунт в разделе Профиль.'],
      },
      {
        title: '3. Получай сигналы',
        lines: ['Запроси сигнал и следуй инструкции, показанной в боте.'],
      },
    ],
    warningPrefix: 'Если аккаунт не зарегистрирован с этим промокодом,',
    warningStrong: 'сигналы могут быть недоступны.',
    registrationButton: 'РЕГИСТРАЦИЯ',
    promoCode: PROMO_CODE,
    registrationAlert: 'Добавь ссылку на регистрацию 1WIN, чтобы эта кнопка открывала страницу регистрации.',
    copiedToast: 'Скопировано',
    readCheckboxLabel: 'Я прочитал инструкции',
    checkboxLabel: 'Я зарегистрировался по ссылке и ввел промокод',
    continueButton: 'ПРОДОЛЖИТЬ',
    loginTitle: 'ВВЕДИ СВОЙ ID',
    loginLabel: 'Введи свой ID',
    loginPlaceholder: 'Напиши свой ID',
    helpTitle: 'Где найти мой ID?',
    helpLines: [
      '1. Открой приложение 1win и нажми кнопку меню.',
      'На телефоне: твой ID отображается сверху слева под именем аккаунта.',
      'На компьютере: нажми на иконку профиля сверху слева, ID будет под именем.',
    ],
    loginButton: 'ВОЙТИ',
    submitToast: 'Сохранено',
    online: 'Онлайн',
    signals: 'СИГНАЛЫ',
    status: 'СТАТУС',
    games: 'ИГРЫ',
    profile: 'ПРОФИЛЬ',
    help: 'ПОМОЩЬ',
    change: 'ИЗМ.',
    gamesTitle: 'Игры',
    gamesCopy: 'Здесь будут появляться сигналы и контент по играм.',
    kenoTitle: 'КЕНО',
    minesTitle: 'МИНЫ',
    penaltyTitle: 'ПЕНАЛЬТИ',
    coinFlipTitle: 'КОИН ФЛИП',
    getSignalButton: 'ПОЛУЧИТЬ СИГНАЛ',
    menuButton: 'Меню',
    comingSoonToast: 'Скоро',
    helpScreenTitle: 'Помощь',
    helpScreenCopy: 'Используй вкладку профиля, чтобы посмотреть свой Telegram-профиль и подключенный 1WIN ID.',
    idLabel: 'ID:',
    languageLabel: 'ЯЗ:',
    languageEnglish: 'English',
    languageRussian: 'Русский',
    signalBadge: '● СИГНАЛ',
  },
}

function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null
}

function normalizeLanguage(value) {
  return LANGUAGE_OPTIONS.some((option) => option.code === value) ? value : ''
}

function getCookieValue(name) {
  try {
    const cookieEntry = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${name}=`))

    return cookieEntry ? decodeURIComponent(cookieEntry.split('=').slice(1).join('=')) : ''
  } catch {
    return ''
  }
}

function persistCookie(name, value) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
  } catch {
    // Ignore cookie issues and keep the app usable.
  }
}

function removeCookie(name) {
  try {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
  } catch {
    // Ignore cookie issues and keep the app usable.
  }
}

function getPersistedLanguage() {
  try {
    const storedLanguage = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || '')
    if (storedLanguage) {
      return storedLanguage
    }
  } catch {
    // Fall back to cookie storage.
  }

  return normalizeLanguage(getCookieValue(LANGUAGE_COOKIE_KEY))
}

function getPersistedPlayerId() {
  try {
    return (window.localStorage.getItem(PLAYER_ID_STORAGE_KEY) || '').trim()
  } catch {
    return ''
  }
}

function getPersistedSignalCount() {
  try {
    const storedValue = Number(window.localStorage.getItem(SIGNAL_COUNT_STORAGE_KEY) || '0')
    return Number.isFinite(storedValue) && storedValue >= 0 ? storedValue : 0
  } catch {
    return 0
  }
}

function persistValue(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore storage issues and keep the app usable.
  }
}

function removeValue(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage issues and keep the app usable.
  }
}

async function copyText(value) {
  if (!navigator?.clipboard?.writeText) {
    return false
  }

  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function getDisplayName(user) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  if (fullName) {
    return fullName
  }

  if (user?.username) {
    return `@${user.username}`
  }

  return 'Player'
}

export default function App() {
  const [config, setConfig] = useState(null)
  const [isConfigLoading, setIsConfigLoading] = useState(true)
  const [language, setLanguage] = useState(getPersistedLanguage)
  const [playerId, setPlayerId] = useState(getPersistedPlayerId)
  const [readConfirmed, setReadConfirmed] = useState(false)
  const [registeredConfirmed, setRegisteredConfirmed] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [screen, setScreen] = useState(() => (getPersistedPlayerId() ? 'dashboard' : 'notice'))
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedGame, setSelectedGame] = useState(null)
  const [coinResult, setCoinResult] = useState('heads')
  const [coinDisplay, setCoinDisplay] = useState('heads')
  const [isFlipping, setIsFlipping] = useState(false)
  const [penaltySignal, setPenaltySignal] = useState(null)
  const [kenoMode, setKenoMode] = useState('classic')
  const [kenoSignal, setKenoSignal] = useState([])
  const [minesCount, setMinesCount] = useState(3)
  const [minesSignal, setMinesSignal] = useState([])
  const [signalCount, setSignalCount] = useState(getPersistedSignalCount)
  const [toast, setToast] = useState('')
  const [loadingGame, setLoadingGame] = useState(null)
  const [modalState, setModalState] = useState(null)
  const [isModalClosing, setIsModalClosing] = useState(false)
  const noticePanelFooterRef = useRef(null)
  const noticeToggleTopRef = useRef(null)
  const signalTimersRef = useRef([])
  const flipTimersRef = useRef([])
  const modalTimerRef = useRef(null)

  const webApp = getTelegramWebApp()
  const user = webApp?.initDataUnsafe?.user ?? null
  const selectedLanguage = language || DEFAULT_LANGUAGE
  const t = COPY[selectedLanguage]
  const loadingButtonLabel =
    selectedLanguage === 'ru' ? '\u0417\u0410\u0413\u0420\u0423\u0417\u041a\u0410...' : t.loadingButton
  const registrationUrl = config?.registrationUrl?.trim() || ''
  const registrationButtonLabel = isConfigLoading ? loadingButtonLabel : t.registrationButton
  const modalCopy =
    selectedLanguage === 'ru'
      ? {
          attentionTitle: '\u0412\u041d\u0418\u041c\u0410\u041d\u0418\u0415',
          changeIdTitle: '\u0418\u0417\u041c\u0415\u041d\u0418\u0422\u042c ID',
          changeIdText:
            '\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c ID?',
          gameWarningText: `\u0415\u0441\u043b\u0438 \u0432\u044b \u043d\u0435 \u0432\u0432\u0435\u043b\u0438 \u043f\u0440\u043e\u043c\u043e\u043a\u043e\u0434 '${PROMO_CODE}', \u0441\u0438\u0433\u043d\u0430\u043b \u0431\u0443\u0434\u0435\u0442 \u043d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u043c!`,
          cancel: '\u041e\u0422\u041c\u0415\u041d\u0410',
          confirmChange: '\u0418\u0417\u041c\u0415\u041d\u0418\u0422\u042c',
          confirmPromo: '\u0414\u0410, \u042f \u0412\u0412\u0415\u041b',
        }
      : {
          attentionTitle: 'ATTENTION',
          changeIdTitle: 'CHANGE ID',
          changeIdText: 'Are you sure that you want change ID?',
          gameWarningText: `If you dont enter promo code '${PROMO_CODE}', signal will be incorrect!`,
          cancel: 'CANCEL',
          confirmChange: 'CHANGE',
          confirmPromo: 'YES I ENTERED',
        }
  const canContinue = readConfirmed && registeredConfirmed

  useEffect(() => {
    if (!webApp) {
      return
    }

    webApp.ready()
    webApp.setHeaderColor('#081222')
    webApp.setBackgroundColor('#081222')
  }, [webApp])

  useEffect(() => {
    document.documentElement.lang = selectedLanguage
    document.title = t.documentTitle
  }, [selectedLanguage, t.documentTitle])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast('')
    }, 1800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast])

  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        window.clearTimeout(modalTimerRef.current)
      }
      signalTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      signalTimersRef.current = []
      flipTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      flipTimersRef.current = []
    }
  }, [])

  useLayoutEffect(() => {
    if (noticeToggleTopRef.current === null) {
      return
    }

    const nextTop = noticePanelFooterRef.current?.getBoundingClientRect().top
    if (typeof nextTop === 'number') {
      window.scrollBy(0, nextTop - noticeToggleTopRef.current)
    }

    noticeToggleTopRef.current = null
  }, [expanded])

  useEffect(() => {
    let ignore = false

    async function loadConfig() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/config`)
        const data = await response.json()

        if (!ignore) {
          setConfig(data)
        }
      } catch {
        if (!ignore) {
          setConfig({})
        }
      } finally {
        if (!ignore) {
          setIsConfigLoading(false)
        }
      }
    }

    loadConfig()
    return () => {
      ignore = true
    }
  }, [])

  function handleLanguageSelect(nextLanguage) {
    persistValue(LANGUAGE_STORAGE_KEY, nextLanguage)
    persistCookie(LANGUAGE_COOKIE_KEY, nextLanguage)
    setLanguage(nextLanguage)
    setReadConfirmed(false)
    setRegisteredConfirmed(false)
    setExpanded(true)
    setActiveTab('profile')
    setScreen(playerId ? 'dashboard' : 'notice')
    setToast('')
  }

  function showToast(message) {
    setToast(message)
  }

  function openModal(nextModalState) {
    if (modalTimerRef.current) {
      window.clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }

    setIsModalClosing(false)
    setModalState(nextModalState)
  }

  function closeModal(afterClose) {
    if (!modalState) {
      if (afterClose) {
        afterClose()
      }
      return
    }

    if (modalTimerRef.current) {
      window.clearTimeout(modalTimerRef.current)
    }

    setIsModalClosing(true)
    modalTimerRef.current = window.setTimeout(() => {
      setModalState(null)
      setIsModalClosing(false)
      modalTimerRef.current = null

      if (afterClose) {
        afterClose()
      }
    }, MODAL_ANIMATION_MS)
  }

  function clearSignalTimers() {
    signalTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    signalTimersRef.current = []
  }

  function clearFlipTimers() {
    flipTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    flipTimersRef.current = []
  }

  function handleOpenLanguagePicker() {
    removeValue(LANGUAGE_STORAGE_KEY)
    removeCookie(LANGUAGE_COOKIE_KEY)
    setLanguage('')
    setToast('')
  }

  function incrementSignalCount() {
    setSignalCount((currentCount) => {
      const nextCount = currentCount + 1
      persistValue(SIGNAL_COUNT_STORAGE_KEY, String(nextCount))
      return nextCount
    })
  }

  async function handlePromoCopy() {
    const copied = await copyText(PROMO_CODE)
    showToast(copied ? t.copiedToast : PROMO_CODE)
  }

  function handleRegistration() {
    if (isConfigLoading) {
      return
    }

    if (registrationUrl) {
      if (webApp?.openLink) {
        webApp.openLink(registrationUrl)
        return
      }

      window.open(registrationUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (webApp?.showAlert) {
      webApp.showAlert(t.registrationAlert)
      return
    }

    window.alert(t.registrationAlert)
  }

  function handleContinue() {
    if (!canContinue) {
      return
    }

    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('medium')
    }

    setScreen('login')
  }

  function handleImportantToggle() {
    noticeToggleTopRef.current = noticePanelFooterRef.current?.getBoundingClientRect().top ?? null
    setExpanded((current) => !current)
  }

  function openGame(gameId) {
    clearSignalTimers()
    setLoadingGame(null)
    setSelectedGame(gameId)

    if (gameId === 'mines') {
      setMinesSignal([])
      return
    }

    if (gameId === 'keno') {
      setKenoMode('classic')
      setKenoSignal([])
      return
    }

    if (gameId === 'penalty') {
      setPenaltySignal(null)
      return
    }

    if (gameId === 'coinflip' || gameId === 'penalty' || gameId === 'mines' || gameId === 'keno') {
      return
    }

    showToast(t.comingSoonToast)
  }

  function handleGameOpen(gameId) {
    openModal({ type: 'game-warning', gameId })
  }

  function handlePenaltySignal() {
    clearSignalTimers()
    setPenaltySignal(null)
    setLoadingGame('penalty')

    const timerId = window.setTimeout(() => {
      signalTimersRef.current = signalTimersRef.current.filter((currentId) => currentId !== timerId)
      setPenaltySignal(Math.floor(Math.random() * PENALTY_CELLS))
      setLoadingGame(null)
      incrementSignalCount()

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('light')
      }
    }, 1500)

    signalTimersRef.current.push(timerId)
  }

  function handleCloseGame() {
    clearSignalTimers()
    clearFlipTimers()
    setLoadingGame(null)
    setIsFlipping(false)
    setCoinDisplay(coinResult)
    setKenoSignal([])
    setMinesSignal([])
    setPenaltySignal(null)
    setSelectedGame(null)
  }

  function handleKenoSignal() {
    const currentMode = KENO_MODES.find((mode) => mode.id === kenoMode) ?? KENO_MODES[1]
    clearSignalTimers()
    setKenoSignal([])
    setLoadingGame('keno')

    const timerId = window.setTimeout(() => {
      const revealCount =
        Math.floor(Math.random() * (currentMode.max - currentMode.min + 1)) + currentMode.min
      const shuffled = Array.from({ length: KENO_GRID_CELLS }, (_, index) => index + 1)

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const nextIndex = Math.floor(Math.random() * (index + 1))
        const currentValue = shuffled[index]
        shuffled[index] = shuffled[nextIndex]
        shuffled[nextIndex] = currentValue
      }

      signalTimersRef.current = signalTimersRef.current.filter((currentId) => currentId !== timerId)
      setKenoSignal(shuffled.slice(0, revealCount).sort((left, right) => left - right))
      setLoadingGame(null)
      incrementSignalCount()

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('light')
      }
    }, 1500)

    signalTimersRef.current.push(timerId)
  }

  function handleKenoModeChange(nextMode) {
    setKenoMode(nextMode)
    setKenoSignal([])
  }

  function handleMinesSignal() {
    clearSignalTimers()
    setMinesSignal([])
    setLoadingGame('mines')

    const timerId = window.setTimeout(() => {
      const revealCount =
        MINES_REVEAL_WEIGHTS[Math.floor(Math.random() * MINES_REVEAL_WEIGHTS.length)]
      const shuffled = Array.from({ length: MINES_GRID_CELLS }, (_, index) => index)

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const nextIndex = Math.floor(Math.random() * (index + 1))
        const currentValue = shuffled[index]
        shuffled[index] = shuffled[nextIndex]
        shuffled[nextIndex] = currentValue
      }

      signalTimersRef.current = signalTimersRef.current.filter((currentId) => currentId !== timerId)
      setMinesSignal(shuffled.slice(0, revealCount))
      setLoadingGame(null)
      incrementSignalCount()

      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred('light')
      }
    }, 1500)

    signalTimersRef.current.push(timerId)
  }

  function handleMinesCountChange(nextCount) {
    setMinesCount(nextCount)
    setMinesSignal([])
  }

  function handleCoinSignal() {
    if (isFlipping || loadingGame === 'coinflip') {
      return
    }

    const nextResult = Math.random() < 0.5 ? 'heads' : 'tails'
    const sequence = []
    let nextVisibleSide = coinDisplay === 'heads' ? 'tails' : 'heads'
    const revealTimings = [0, 90, 180, 270, 360, 450, 540, 630]

    for (let index = 0; index < revealTimings.length; index += 1) {
      sequence.push(index === revealTimings.length - 1 ? nextResult : nextVisibleSide)
      nextVisibleSide = nextVisibleSide === 'heads' ? 'tails' : 'heads'
    }

    clearSignalTimers()
    clearFlipTimers()
    setLoadingGame('coinflip')

    const timerId = window.setTimeout(() => {
      signalTimersRef.current = signalTimersRef.current.filter((currentId) => currentId !== timerId)
      setIsFlipping(true)
      incrementSignalCount()

      sequence.forEach((side, index) => {
        const flipTimerId = window.setTimeout(() => {
          setCoinDisplay(side)
        }, revealTimings[index])
        flipTimersRef.current.push(flipTimerId)
      })

      const finishTimerId = window.setTimeout(() => {
        setCoinDisplay(nextResult)
        setCoinResult(nextResult)
        setIsFlipping(false)
        setLoadingGame(null)
        flipTimersRef.current = []
      }, 720)

      flipTimersRef.current.push(finishTimerId)
    }, 1500)

    signalTimersRef.current.push(timerId)
  }

  function handleLogin() {
    const normalizedId = playerId.trim()
    if (!normalizedId) {
      return
    }

    persistValue(PLAYER_ID_STORAGE_KEY, normalizedId)
    setPlayerId(normalizedId)
    setActiveTab('profile')
    setScreen('dashboard')

    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('medium')
    }

    if (webApp?.sendData) {
      webApp.sendData(
        JSON.stringify({
          action: 'login_id_submit',
          language: selectedLanguage,
          promoCode: PROMO_CODE,
          playerId: normalizedId,
          readConfirmed,
          registeredConfirmed,
        }),
      )
    }

    showToast(t.submitToast)
  }

  function handleChangeId() {
    openModal({ type: 'change-id' })
  }

  function handleModalClose() {
    closeModal()
  }

  function handleModalConfirm() {
    if (!modalState) {
      return
    }

    if (modalState.type === 'change-id') {
      closeModal(() => {
        removeValue(PLAYER_ID_STORAGE_KEY)
        setPlayerId('')
        setReadConfirmed(false)
        setRegisteredConfirmed(false)
        setExpanded(true)
        setSelectedGame(null)
        setScreen('notice')
        setActiveTab('profile')
        showToast('')
      })
      return
    }

    if (modalState.type === 'game-warning') {
      const { gameId } = modalState
      closeModal(() => {
        openGame(gameId)
      })
    }
  }

  function renderModal() {
    if (!modalState) {
      return null
    }

    const isChangeIdModal = modalState.type === 'change-id'

    return (
      <div
        className={`app-modal ${isModalClosing ? 'app-modal--closing' : ''}`}
        role="presentation"
      >
        <div
          className="app-modal__card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="app-modal-title" className="app-modal__title">
            {isChangeIdModal ? modalCopy.changeIdTitle : modalCopy.attentionTitle}
          </h2>

          <p className="app-modal__copy">
            {isChangeIdModal ? modalCopy.changeIdText : modalCopy.gameWarningText}
          </p>

          <div className="app-modal__actions">
            <button type="button" className="app-modal__button app-modal__button--ghost" onClick={handleModalClose}>
              {modalCopy.cancel}
            </button>

            <button type="button" className="app-modal__button" onClick={handleModalConfirm}>
              {isChangeIdModal ? modalCopy.confirmChange : modalCopy.confirmPromo}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderInstructionContent() {
    return (
      <>
        {t.introLines.map((line) => (
          <p key={line} className="notice-copy">
            {line}
          </p>
        ))}

        <p className="notice-profit">{t.profitTitle}</p>

        <div className="notice-steps">
          {t.steps.map((step) => (
            <div key={step.title} className="notice-step">
              <div className="notice-step__title">{step.title}</div>
              {step.lines.map((line) => (
                <div key={line} className="notice-step__line">
                  / {line} /
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    )
  }

  function renderDashboardContent() {
    if (activeTab === 'games') {
      if (selectedGame === 'keno') {
        return (
          <section className="keno-screen">
            <div className="coinflip-screen__header">
              <span>{t.kenoTitle}</span>
            </div>

            <div className="keno-modes" role="tablist" aria-label="Keno mode">
              {KENO_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`keno-mode ${kenoMode === mode.id ? 'keno-mode--active' : ''}`}
                  onClick={() => handleKenoModeChange(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="keno-board" aria-label={`${t.kenoTitle} signal board`}>
              <div className="keno-grid">
                {Array.from({ length: KENO_GRID_CELLS }, (_, index) => {
                  const cellNumber = index + 1
                  const isSelected = kenoSignal.includes(cellNumber)

                  return (
                    <div
                      key={cellNumber}
                      className={`keno-cell ${isSelected ? 'keno-cell--selected' : ''}`}
                    >
                      <span className="keno-cell__number">{cellNumber}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              className="registration-button coinflip-button"
              onClick={handleKenoSignal}
              disabled={loadingGame === 'keno'}
            >
              {loadingGame === 'keno' ? loadingButtonLabel : t.getSignalButton}
            </button>

            <button type="button" className="coinflip-menu" onClick={handleCloseGame}>
              {'<'} {t.menuButton}
            </button>
          </section>
        )
      }

      if (selectedGame === 'mines') {
        return (
          <section className="mines-screen">
            <div className="coinflip-screen__header">
              <img src="/games/mines-star.svg" alt="" className="coinflip-screen__icon" />
              <span>{t.minesTitle}</span>
            </div>

            <div className="mines-options" role="tablist" aria-label="Mines count">
              {MINES_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`mines-option ${minesCount === option ? 'mines-option--active' : ''}`}
                  onClick={() => handleMinesCountChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mines-board" aria-label={`${t.minesTitle} signal board`}>
              <div className="mines-grid">
                {Array.from({ length: MINES_GRID_CELLS }).map((_, cellIndex) => {
                  const hasStar = minesSignal.includes(cellIndex)
                  const revealOrder = hasStar ? minesSignal.indexOf(cellIndex) : -1

                  return (
                    <div
                      key={cellIndex}
                      className={`mines-cell ${hasStar ? 'mines-cell--active' : ''}`}
                      style={hasStar ? { '--mines-reveal-delay': `${revealOrder * 70}ms` } : undefined}
                    >
                      <img src="/games/mines-tile.svg" alt="" className="mines-cell__base" aria-hidden="true" />
                      {hasStar ? (
                        <img src="/games/mines-star.svg" alt="Safe signal" className="mines-cell__star" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              className="registration-button coinflip-button"
              onClick={handleMinesSignal}
              disabled={loadingGame === 'mines'}
            >
              {loadingGame === 'mines' ? loadingButtonLabel : t.getSignalButton}
            </button>

            <button type="button" className="coinflip-menu" onClick={handleCloseGame}>
              {'<'} {t.menuButton}
            </button>
          </section>
        )
      }

      if (selectedGame === 'penalty') {
        return (
          <section className="penalty-screen">
            <div className="coinflip-screen__header">
              <img src="/games/penalty-ball.png" alt="" className="coinflip-screen__icon" />
              <span>{t.penaltyTitle}</span>
            </div>

            <div className="penalty-field" aria-label={`${t.penaltyTitle} signal field`}>
              <div className="penalty-grid">
                {Array.from({ length: PENALTY_ROWS }).map((_, rowIndex) =>
                  Array.from({ length: PENALTY_COLUMNS }).map((__, columnIndex) => {
                    const cellIndex = rowIndex * PENALTY_COLUMNS + columnIndex
                    const hasBall = penaltySignal === cellIndex

                    return (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        className={`penalty-cell ${hasBall ? 'penalty-cell--active' : ''}`}
                      >
                        {hasBall ? (
                          <img
                            src="/games/penalty-ball.png"
                            alt="Penalty signal"
                            className="penalty-cell__ball"
                          />
                        ) : null}
                      </div>
                    )
                  }),
                )}
              </div>
            </div>

            <button
              type="button"
              className="registration-button coinflip-button"
              onClick={handlePenaltySignal}
              disabled={loadingGame === 'penalty'}
            >
              {loadingGame === 'penalty' ? loadingButtonLabel : t.getSignalButton}
            </button>

            <button type="button" className="coinflip-menu" onClick={handleCloseGame}>
              {'<'} {t.menuButton}
            </button>
          </section>
        )
      }

      if (selectedGame === 'coinflip') {
        const visibleCoin = COIN_SIDES[coinDisplay]
        const currentCoin = COIN_SIDES[isFlipping ? coinDisplay : coinResult]

        return (
          <section className="coinflip-screen">
            <div className="coinflip-screen__header">
              <img src="/games/coin-gold.png" alt="" className="coinflip-screen__icon" />
              <span>{t.coinFlipTitle}</span>
            </div>

            <div className="coinflip-coin-wrap">
              <div className={`coinflip-coin ${isFlipping ? 'coinflip-coin--flipping' : ''}`}>
                <img src={visibleCoin.image} alt={`${coinDisplay} coin`} className="coinflip-coin__image" />
              </div>
            </div>

            <div className="coinflip-result">{`1WIN - ${currentCoin.label}`}</div>

            <button
              type="button"
              className="registration-button coinflip-button"
              onClick={handleCoinSignal}
              disabled={loadingGame === 'coinflip' || isFlipping}
            >
              {loadingGame === 'coinflip' || isFlipping ? loadingButtonLabel : t.getSignalButton}
            </button>

            <button type="button" className="coinflip-menu" onClick={handleCloseGame}>
              {'<'} {t.menuButton}
            </button>
          </section>
        )
      }

      return (
        <section className="games-board">
          <div className="games-board__header">{t.gamesTitle}</div>

          <div className="games-grid">
            {GAME_CARDS.map((game) => (
              <button
                key={game.id}
                type="button"
                className={`game-card ${game.wide ? 'game-card--wide' : ''}`}
                style={{ backgroundImage: `url(${game.image})` }}
                onClick={() => handleGameOpen(game.id)}
                onTouchStart={() => handleGameOpen(game.id)}
              >
                <div className="game-card__overlay" />
                <div className="game-card__content">
                  <div className="game-card__title">{t[game.titleKey]}</div>
                  <div className="game-card__badge">{t.signalBadge}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )
    }

    if (activeTab === 'help') {
      return (
        <section className="dashboard-card dashboard-card--help">
          <h2>{t.importantTitle}</h2>
          <div className="dashboard-help__content">{renderInstructionContent()}</div>
          <button type="button" className="promo-pill dashboard-help__promo" onClick={handlePromoCopy}>
            <span className="promo-pill__code">{t.promoCode}</span>
          </button>
        </section>
      )
    }

    return (
      <section className="profile-card">
        <div className="profile-avatar" aria-hidden="true">
          <span>👤</span>
        </div>

        <h2 className="profile-name">{getDisplayName(user)}</h2>

        <div className="profile-meta-row">
          <div className="profile-id-row">
            <span className="profile-id-row__label">{t.idLabel}</span>
            <span className="profile-id-row__value">{playerId}</span>
            <button type="button" className="profile-id-row__action" onClick={handleChangeId}>
              {t.change}
            </button>
          </div>

          <div className="profile-language-row">
            <span className="profile-language-row__label">{t.languageLabel}</span>
            <span className="profile-language-row__value">
              {selectedLanguage === 'ru' ? t.languageRussian : t.languageEnglish}
            </span>
            <button
              type="button"
              className="profile-language-row__action"
              onClick={handleOpenLanguagePicker}
            >
              {t.change}
            </button>
          </div>
        </div>

        <div className="profile-stats">
          <article className="profile-stat">
            <strong>{signalCount}</strong>
            <span>{t.signals}</span>
          </article>
          <article className="profile-stat">
            <strong>{t.online}</strong>
            <span>{t.status}</span>
          </article>
        </div>

        <div className="profile-footer">
          <div className="profile-footer__line">{getDisplayName(user)}</div>
          <div className="profile-footer__subline">1WIN ID: {playerId}</div>
        </div>
      </section>
    )
  }

  if (!language) {
    return (
      <main className="language-screen">
        <section className="language-screen__content">
          <header className="brand-lockup" aria-label="1WIN Signals">
            <span className="brand-lockup__line brand-lockup__line--light">1WIN</span>
            <span className="brand-lockup__line brand-lockup__line--accent">SIGNALS</span>
          </header>

          <div className="language-picker">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                className="language-card"
                onClick={() => handleLanguageSelect(option.code)}
              >
                <span className="language-card__code">{option.badge}</span>
                <span className="language-card__label">{option.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    )
  }

  if (screen === 'dashboard') {
    const dashboardScreenClassName = [
      'dashboard-screen',
      activeTab === 'games' && selectedGame === 'mines' ? 'dashboard-screen--mines' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <main className={dashboardScreenClassName}>
        {toast ? <div className="toast">{toast}</div> : null}
        {renderModal()}

        <section className="dashboard-layout">
          <div className="dashboard-content">
            <div key={activeTab} className="dashboard-tab-transition">
              {renderDashboardContent()}
            </div>
          </div>

          <nav className="bottom-nav">
            <button
              type="button"
              className={`bottom-nav__item ${activeTab === 'games' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => setActiveTab('games')}
            >
              <span className="bottom-nav__icon">▭</span>
              <span>{t.games}</span>
            </button>

            <button
              type="button"
              className={`bottom-nav__item ${activeTab === 'profile' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="bottom-nav__icon">◉</span>
              <span>{t.profile}</span>
            </button>

            <button
              type="button"
              className={`bottom-nav__item ${activeTab === 'help' ? 'bottom-nav__item--active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <span className="bottom-nav__icon">☰</span>
              <span>{t.help}</span>
            </button>
          </nav>
        </section>
      </main>
    )
  }

  if (screen === 'login') {
    return (
      <main className="notice-screen">
        {toast ? <div className="toast">{toast}</div> : null}

        <section className="notice-layout">
          <div className="notice-icon" aria-hidden="true">
            #
          </div>
          <h1 className="notice-title notice-title--small">{t.loginTitle}</h1>

          <section className="id-entry-card">
            <label className="id-field">
              <span className="id-field__label">{t.loginLabel}</span>
              <input
                type="text"
                inputMode="numeric"
                value={playerId}
                onChange={(event) => setPlayerId(event.target.value)}
                placeholder={t.loginPlaceholder}
              />
            </label>
          </section>

          <section className="help-card">
            <div className="help-card__title">{t.helpTitle}</div>
            <div className="help-card__body">
              {t.helpLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="continue-button"
            onClick={handleLogin}
            disabled={!playerId.trim()}
          >
            {t.loginButton}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="notice-screen">
      {toast ? <div className="toast">{toast}</div> : null}

      <section className="notice-layout">
        <div className="notice-icon" aria-hidden="true">
          !
        </div>
        <h1 className="notice-title">{t.importantTitle}</h1>

        <section className="notice-panel">
          <div className="notice-panel__heading">
            <span className="notice-panel__heading-text">{t.mustReadTitle}</span>
          </div>

          <div className={`notice-panel__body ${expanded ? 'notice-panel__body--expanded' : ''}`}>
            {renderInstructionContent()}
          </div>

          <button
            type="button"
            className="notice-panel__footer"
            onClick={handleImportantToggle}
            aria-expanded={expanded}
            ref={noticePanelFooterRef}
          >
            <span className="notice-panel__footer-icon">{expanded ? '^' : 'v'}</span>
            <span className="notice-panel__footer-label">
              {expanded ? t.collapseLabel : t.expandLabel}
            </span>
          </button>
        </section>

        <button type="button" className="promo-pill" onClick={handlePromoCopy}>
          <span className="promo-pill__code">{t.promoCode}</span>
        </button>

        <label className="confirm-row">
          <input
            type="checkbox"
            checked={readConfirmed}
            onChange={(event) => setReadConfirmed(event.target.checked)}
          />
          <span>{t.readCheckboxLabel}</span>
        </label>

        <p className="notice-warning">
          {t.warningPrefix} <span>{t.warningStrong}</span>
        </p>

        <button
          type="button"
          className="registration-button"
          onClick={handleRegistration}
          disabled={isConfigLoading}
        >
          {registrationButtonLabel}
        </button>

        <label className="confirm-row">
          <input
            type="checkbox"
            checked={registeredConfirmed}
            onChange={(event) => setRegisteredConfirmed(event.target.checked)}
          />
          <span>{t.checkboxLabel}</span>
        </label>

        <button
          type="button"
          className="continue-button"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          {t.continueButton}
        </button>
      </section>
    </main>
  )
}
