import { CapacitorTusClient } from '@hbolte/capacitor-tus-client';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    CapacitorTusClient.echo({ value: inputValue })
}
