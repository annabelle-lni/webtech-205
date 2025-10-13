import {use} from 'react';

export default async function Recettes({
  params,
}: {
  params: Promise<{ recettes: string }>
}) {
  const { recettes } = use(params)
 
  return (
    <div>
      <h1>Mes recettes {recettes}</h1>
    </div>
  )
}