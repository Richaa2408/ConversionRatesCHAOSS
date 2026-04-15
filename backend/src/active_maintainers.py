import httpx
from datetime import datetime, timedelta, timezone
from config import HEADERS


async def active_maintainers(owner, repo, days=90):
    MAX_PAGES = 15
    page = 1
    maintainers = set()

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    async with httpx.AsyncClient() as client:

        while page <= MAX_PAGES:
            url = f"https://api.github.com/repos/{owner}/{repo}/commits"
            params = {
                "per_page": 100,
                "page": page
            }

            response = await client.get(
                url,
                headers=HEADERS,
                params=params,
                timeout=10
            )

            if response.status_code != 200:
                break

            data = response.json()

            if not data:
                break

            for commit in data:
                datestr = commit["commit"]["author"]["date"]
                date = datetime.fromisoformat(
                    datestr.replace("Z", "+00:00")
                )

                if date < cutoff:
                    continue

                if commit.get("author") and commit["author"].get("login"):
                    maintainers.add(commit["author"]["login"])

            page += 1

    return len(maintainers)