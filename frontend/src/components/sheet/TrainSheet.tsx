import { Clock } from 'lucide-react'
import { useState } from 'react'
import { STATIONS, TRAINS, daysText, fmDur, fmTime } from '../../data/mockData'
import { useAppState } from '../../store/appState'
import type { SavedEntity } from '../../store/appState'
import { DayChips, daysCaption } from '../ui/DayChips'
import { EntityRow } from '../ui/EntityRow'
import { ScheduledNotice } from '../ui/ScheduledNotice'
import { SectionHeader } from '../ui/SectionHeader'
import { SmallSegmented } from '../ui/Segmented'
import { BottomSheet } from './BottomSheet'

interface Props {
  trainNum: string
}

export function TrainSheet({ trainNum }: Props) {
  const [showAll, setShowAll] = useState(false)
  const { pushSheet, toggleFavourite, isFavourite, addRecentlyViewed, showToast } = useAppState()

  const train = TRAINS[trainNum]
  if (!train) return null

  const src = STATIONS[train.src]
  const dst = STATIONS[train.dst]
  const depStop = train.stops[0]
  const arrStop = train.stops[train.stops.length - 1]
  const arrDay = arrStop.day > 1 ? `+${arrStop.day - 1}d` : ''

  const halts = train.stops.filter(s => !s.pass && s.arr !== null && s.dep !== null)
  const displayStops = showAll ? train.stops : train.stops.filter(s => !s.pass)

  const entityForSave: SavedEntity = {
    kind: 'train', id: train.num, code: train.num,
    title: train.name, sub: `${src?.name} → ${dst?.name}`, ts: Date.now(),
  }
  const fav = isFavourite('train', train.num)

  const openStation = (code: string) => {
    addRecentlyViewed({ kind: 'station', id: code, code, title: STATIONS[code]?.name ?? code, sub: code, ts: Date.now() })
    pushSheet({ kind: 'station', id: code })
  }

  const openPair = () => {
    if (train.pair && TRAINS[train.pair]) {
      pushSheet({ kind: 'train', id: train.pair })
    }
  }

  return (
    <BottomSheet
      kind="train"
      kicker={`Train · ${train.type}`}
      title={train.name}
      code={train.num}
      sub={`${src?.name ?? train.src} → ${dst?.name ?? train.dst}`}
      canFav
      isFav={fav}
      onFav={() => { toggleFavourite(entityForSave); showToast(fav ? 'Removed from saved' : 'Saved to this device') }}
    >
      {/* Journey card */}
      <div style={{ background: '#f1f4f8', borderRadius: 18, padding: 14, marginTop: 8 }}>
        {/* Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Pill><Clock size={13} strokeWidth={2} />{fmDur(train.mins)}</Pill>
          <Pill>{train.km} km</Pill>
          <Pill>{halts.length} halts</Pill>
        </div>

        {/* Origin → Destination */}
        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: '0 10px', marginTop: 12, alignItems: 'center' }}>
          {/* Origin dot */}
          <div style={{ width: 18, height: 18, borderRadius: 9, border: '2px dashed #0fa390' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{src?.name ?? train.src}</div>
            <div style={{ fontSize: 11, color: '#5b6574' }}>{train.src} · Departs</div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {fmTime(depStop.dep)}
          </span>

          {/* Connector */}
          <div style={{ height: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2b6ef2' }}>
            <div style={{ flex: 1, borderLeft: '2px dashed #b8cdf8' }} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="16" height="16" x="4" y="3" rx="2" />
              <path d="M4 11h16" /><path d="M12 3v8" />
              <path d="m8 19-2 3" /><path d="m18 22-2-3" />
              <path d="M8 15h.01" /><path d="M16 15h.01" />
            </svg>
            <div style={{ flex: 1, borderLeft: '2px dashed #b8cdf8' }} />
          </div>
          <div /><div />

          {/* Destination dot */}
          <div style={{ width: 18, height: 18, borderRadius: 9, background: '#2b6ef2', boxShadow: '0 0 0 3px #cddcfd' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{dst?.name ?? train.dst}</div>
            <div style={{ fontSize: 11, color: '#5b6574' }}>{train.dst} · Arrives</div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {fmTime(arrStop.arr)}
            {arrDay && <sup style={{ fontSize: 10, color: '#a2620a', marginLeft: 2 }}>{arrDay}</sup>}
          </span>
        </div>
      </div>

      {/* Day chips */}
      <DayChips days={train.days} caption={daysCaption(train.days)} />

      {/* Save + Return buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: train.pair ? '1fr 1fr' : '1fr', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => { toggleFavourite(entityForSave); showToast(fav ? 'Removed from saved' : 'Saved to this device') }}
          style={{ height: 44, borderRadius: 14, border: 0, background: '#2b6ef2', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#1f5ee0')}
          onMouseLeave={e => (e.currentTarget.style.background = '#2b6ef2')}
        >
          {fav ? 'Saved ✓' : 'Save'}
        </button>
        {train.pair && (
          <button
            onClick={openPair}
            style={{ height: 44, borderRadius: 14, border: 0, background: '#eef1f5', color: '#0f1722', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e6eaf0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#eef1f5')}
          >
            Return · {train.pair}
          </button>
        )}
      </div>

      {/* Timetable */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 8px' }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Timetable</span>
        <SmallSegmented
          options={[{ label: 'Halts', value: 'halts' }, { label: 'All stops', value: 'all' }]}
          value={showAll ? 'all' : 'halts'}
          onChange={v => setShowAll(v === 'all')}
        />
      </div>

      <div style={{ background: '#f1f4f8', borderRadius: 18, padding: '4px 12px' }}>
        {displayStops.map((stop, i) => {
          const isFirst = stop.code === train.src
          const isLast = stop.code === train.dst
          const isHalt = !stop.pass && !isFirst && !isLast
          const markerSize = isFirst || isLast ? 16 : stop.pass ? 7 : 12
          let markerBg = '#fff'
          let markerBorder = `2.5px solid ${isFirst ? '#0fa390' : '#2b6ef2'}`
          let markerShadow = ''
          if (isFirst) { markerBg = 'transparent'; markerBorder = '2px dashed #0fa390' }
          else if (isLast) { markerBg = '#2b6ef2'; markerShadow = '0 0 0 3px #cddcfd'; markerBorder = 'none' }
          else if (stop.pass) { markerBg = '#c3cad6'; markerBorder = 'none' }

          const isFirstRow = i === 0
          const isLastRow = i === displayStops.length - 1

          return (
            <div
              key={stop.code + i}
              onClick={() => openStation(stop.code)}
              className="row-hover-2"
              style={{
                display: 'grid',
                gridTemplateColumns: '18px 1fr 44px 44px',
                gap: '0 8px',
                alignItems: 'center',
                minHeight: 54,
                cursor: 'pointer',
                opacity: stop.pass ? 0.55 : 1,
                borderRadius: 8,
                padding: '0 4px',
              }}
            >
              {/* Timeline column */}
              <div style={{ position: 'relative', alignSelf: 'stretch', display: 'grid', placeItems: 'center' }}>
                {!isFirstRow && <div style={{ position: 'absolute', left: 8, top: 0, bottom: '50%', borderLeft: '2px dashed #b8cdf8' }} />}
                {!isLastRow && <div style={{ position: 'absolute', left: 8, top: '50%', bottom: 0, borderLeft: '2px dashed #b8cdf8' }} />}
                <div style={{
                  position: 'relative',
                  width: markerSize, height: markerSize, borderRadius: '50%',
                  background: markerBg, border: markerBorder, boxShadow: markerShadow,
                }} />
              </div>

              {/* Name + meta */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {STATIONS[stop.code]?.name ?? stop.code}
                </div>
                <div style={{ fontSize: 11, color: '#5b6574' }}>
                  {stop.code}{isHalt ? ` · ${stop.halt}m` : ''}{stop.km > 0 ? ` · ${stop.km}km` : ''}{stop.day > 1 ? ` · D${stop.day}` : ''}
                </div>
              </div>

              {/* Arr */}
              <span style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#5b6574' }}>
                {isFirst ? '' : fmTime(stop.arr)}
              </span>
              {/* Dep */}
              <span style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {isLast ? '' : stop.pass ? 'pass' : fmTime(stop.dep)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Related trains */}
      <SectionHeader title="Related trains" />
      <div style={{ background: '#f1f4f8', borderRadius: 18, overflow: 'hidden' }}>
        {train.pair && TRAINS[train.pair] ? (
          <EntityRow
            kind="train"
            code={TRAINS[train.pair].num}
            title={TRAINS[train.pair].name}
            sub={`${daysText(TRAINS[train.pair].days)} · ${TRAINS[train.pair].type}`}
            onPress={() => pushSheet({ kind: 'train', id: train.pair! })}
            onSurface2
          />
        ) : (
          <div style={{ padding: '14px 12px', fontSize: 13, color: '#5b6574' }}>No related trains.</div>
        )}
      </div>

      {/* Data note */}
      <div style={{ margin: '14px 2px 0', fontSize: 11, color: '#9aa3b2' }}>
        Timetable v2026.10.2 · Last verified 21 Oct 2026 · Sample data
      </div>

      <ScheduledNotice />
    </BottomSheet>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 14, background: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}
