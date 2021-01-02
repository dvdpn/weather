static getIOSScope(): string {
    const standalone = (window.navigator as any).standalone;
    const userAgent = window.navigator.userAgent.toLowerCase();
    const safari = /safari/.test(userAgent);
    const ios = /iphone|ipod|ipad/.test(userAgent);
    if (ios) {
        if (!standalone && safari) {
            return 'browser';
        } else if (standalone && !safari) {
            return 'standalone';
        } else if (!standalone && !safari) {
            return 'uiwebview';
        }
    }
    return 'another';
}

static fixIOSLinks() {
    const scope = Utils.getIOSScope();
    if (scope !== 'standalone' && scope !== 'uiwebview') {
        return;
    }
    // _blank links open inside
    const links = document.getElementsByTagName('a');
    for (let i = 0; i < links.length; ++i) {
        if (links[i].getAttribute('target') == '_blank') {
            links[i].removeAttribute('target');
            links[i].setAttribute('data-target', '_blank');
        }
    }
    // not _blank links open outside => iOS is piece of shit
    document.addEventListener('click', function (e) {
        let element: Element = e.target as Element;
        while (!/^(a|html)$/i.test(element.nodeName) && element.parentNode) {
            element = element.parentNode as Element;
        }
        if (element.getAttribute) {
            const href = element.getAttribute('href');
            const target = element.getAttribute('data-target');
            if (target) {
                return;
            }
            const protocol = (element as any).protocol;
            const isHrefDefined = !!href && '#' !== href;
            if (isHrefDefined) {
                const isWebProtocol = !protocol || protocol !== 'tel:';
                const isRelativePath = Utils.isRelativePath(href);
                const pattern = new RegExp("^[a-z][a-z0-9+.-]*:\/\/" + window.document.location.host);
                const isCurrentHost = pattern.test(href);
                if (isWebProtocol && (isRelativePath || isCurrentHost)) {
                    e.preventDefault();
                    window.document.location.assign(href);
                }
            }
        }
    }, false);
}
