import Link from "next/link"

const ART = `
 ##    ###   ##
#  #  #   # #  #
#  #  #   # #  #
####  #   # ####
   #  #   #    #
   #   ###     #
`

export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <pre className="text-4xl leading-tight font-bold">{ART}</pre>
      <p className="text-sm text-muted-foreground">
        this page doesn&apos;t exist — yet.
      </p>
      <Link
        href="/"
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        back to safety
      </Link>
    </div>
  )
}
