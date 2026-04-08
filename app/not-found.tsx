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
      <pre className="text-4xl font-bold leading-tight">{ART}</pre>
      <p className="text-muted-foreground text-sm">
        this page doesn&apos;t exist — yet.
      </p>
      <Link
        href="/"
        className="text-muted-foreground text-xs underline underline-offset-4 hover:text-foreground"
      >
        back to safety
      </Link>
    </div>
  )
}
