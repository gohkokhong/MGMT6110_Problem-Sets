import { Select } from '~/components/catalyst/select'
import { TableSearchInput } from '~/components/TableControls'

export type SelectFilter = {
  /** Names the select for assistive tech and keys it. */
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

/** The search box and drop-downs above a list. One column on a phone, one row from `sm` up. */
export function ListFilters({
  searchPlaceholder,
  onSearch,
  selects,
}: {
  searchPlaceholder: string
  onSearch: (term: string) => void
  selects: SelectFilter[]
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <TableSearchInput placeholder={searchPlaceholder} onSearch={onSearch} className="sm:min-w-64 sm:flex-1" />
      {selects.map((select) => (
        <Select
          key={select.label}
          aria-label={select.label}
          value={select.value}
          onChange={(e) => select.onChange(e.target.value)}
          className="sm:w-52"
        >
          {select.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ))}
    </div>
  )
}
