import Button from '@components/atoms/Button'

export default function Page404() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-4 text-center">
      <p className="font-display text-6xl">🐾</p>
      <h1 className="font-display text-3xl font-extrabold">
        Oyen can&apos;t find that room.
      </h1>
      <Button href="/">Back to the room</Button>
    </main>
  )
}
