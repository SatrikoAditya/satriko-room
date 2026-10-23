import type { IGamingSnapshot } from '@models/game'

import snapshot from './gaming.snapshot.json'

/** Written by `yarn games:sync` (decision 52); empty until the first sync. */
export const gaming = snapshot as IGamingSnapshot
