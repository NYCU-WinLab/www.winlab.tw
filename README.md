```
██╗    ██╗██╗███╗   ██╗██╗      █████╗ ██████╗ 
██║    ██║██║████╗  ██║██║     ██╔══██╗██╔══██╗
██║ █╗ ██║██║██╔██╗ ██║██║     ███████║██████╔╝
██║███╗██║██║██║╚██╗██║██║     ██╔══██║██╔══██╗
╚███╔███╔╝██║██║ ╚████║███████╗██║  ██║██████╔╝
 ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═════╝
```

# www.winlab.tw

We deploy on Fridays. The official website of Wireless Internet Laboratory, NYCU.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Keycloak Admin API
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animation**: Motion (Framer Motion)
- **Package Manager**: Bun

## Getting Started

```bash
bun install
bun dev
```

## Environment Variables

Create a `.env.local` file:

```
KEYCLOAK_URL=https://auth.winlab.tw
KEYCLOAK_REALM=winlab
KEYCLOAK_ADMIN_CLIENT_ID=your-client-id
KEYCLOAK_ADMIN_CLIENT_SECRET=your-secret
```

## License

[MIT](LICENSE.md) — deploy responsibly, even on Fridays.
