import type { Repository, Changeset } from './state';

type APIFilterParams = {
  full: boolean;
  count: number;
};

type APIPushMeta = {
  count: number;
  repository: Repository['name'];
  filter_params: APIFilterParams;
};

export type APIPushResponse = {
  meta: APIPushMeta;
  results: Changeset[];
};
