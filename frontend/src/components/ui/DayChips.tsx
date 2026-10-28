const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAYNAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  days: number[]
  caption?: string
}

export function DayChips({ days, caption }: Props) {
  const todayIdx = new Date().getDay()
  const todayRailynIdx = todayIdx === 0 ? 6 : todayIdx - 1 // Mon=0

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 5, marginTop: 12 }}>
        {DAYS.map((label, i) => {
          const runs = days.includes(i)
          const isToday = i === todayRailynIdx
          return (
            <div
              key={i}
              style={{
                height: 42,
                borderRadius: 21,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                fontSize: 13,
                fontWeight: 600,
                background: runs ? '#2b6ef2' : '#eef1f5',
                color: runs ? '#fff' : '#9aa3b2',
              }}
            >
              {label}
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  background: isToday ? '#e59a1a' : 'transparent',
                }}
              />
            </div>
          )
        })}
      </div>
      {caption && (
        <div style={{ fontSize: 12, color: '#5b6574', margin: '6px 4px 0', lineHeight: 1.4 }}>
          {caption} from origin · <span style={{ color: '#a2620a', fontWeight: 600 }}>● today</span>
        </div>
      )}
    </div>
  )
}

export function daysCaption(days: number[]): string {
  if (days.length === 7) return 'Runs daily'
  return 'Runs ' + days.map(i => DAYNAMES[i]).join(' ')
}
