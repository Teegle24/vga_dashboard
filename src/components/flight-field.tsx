import { SelectField } from '@/components/ui/field'
import { FLIGHTS, type Flight } from '@/lib/flights'

export function FlightField({
  value,
  onChange,
}: {
  value: Flight | ''
  onChange: (value: Flight | '') => void
}) {
  return (
    <SelectField
      label="Flight"
      value={value}
      onChange={(e) => onChange((e.target.value || '') as Flight | '')}
    >
      <option value="">Choose a flight</option>
      {FLIGHTS.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </SelectField>
  )
}
