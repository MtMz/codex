from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8000"
OUTPUT = "artifacts/tv-program-app-firefox.png"


def main() -> None:
    with sync_playwright() as playwright:
        # Chromium が環境依存でクラッシュするケースがあるため、
        # 安定している Firefox を既定ブラウザとして利用する。
        browser = playwright.firefox.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(URL, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        page.screenshot(path=OUTPUT, full_page=True)
        browser.close()


if __name__ == "__main__":
    main()
