function SelfHealingDriver(driver, url) {
    const originalWait = driver.wait;
    driver.wait = async function (...params) {
        await setWaitFlag(driver, url, true);
        try {
            return originalWait.apply(driver, params)
        } catch (err) {
            await setWaitFlag(driver, url, false);
            return originalWait.apply(driver, params)
        } finally {
            await setWaitFlag(driver, url, false);
        }
    }
    return driver;
}

async function setWaitFlag(driver, url, isWait) {
    let sessionId;
    await driver.getSession().then(r => {
        sessionId = r.getId()
    });
    fetch(`${url}/session/${sessionId}/healenium/params`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({isWait: isWait})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
        })
        .catch(function (error) {
            console.error('An error occurred while fetching:', error);
        });
}

module.exports = {SelfHealingDriver};