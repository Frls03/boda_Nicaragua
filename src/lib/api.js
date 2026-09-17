import { GraphQLClient, gql } from 'graphql-request';

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;
const client = endpoint ? new GraphQLClient(endpoint) : null;

// ponytail: nombres de query/mutation son un contrato supuesto.
// Ajustá campos/nombres al schema real de tu backend.
const RSVP_STATUS_QUERY = gql`
  query RsvpStatus($token: String!) {
    rsvpStatus(token: $token) {
      attending
      guests
      notes
      confirmedAt
    }
  }
`;

const SUBMIT_RSVP_MUTATION = gql`
  mutation SubmitRsvp($input: RsvpInput!) {
    submitRsvp(input: $input) {
      attending
      guests
      notes
      confirmedAt
    }
  }
`;

export async function getRsvpStatus(token) {
  if (!client || !token) return null;
  const data = await client.request(RSVP_STATUS_QUERY, { token });
  return data.rsvpStatus;
}

export async function submitRsvp(input) {
  if (!client) throw new Error('VITE_GRAPHQL_ENDPOINT no configurado');
  const data = await client.request(SUBMIT_RSVP_MUTATION, { input });
  return data.submitRsvp;
}

export function formatDateEs(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}
