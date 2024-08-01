/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { FluxDispatcher, ReactDOM, useEffect, useState } from "@webpack/common";
import { Root } from "react-dom/client";

let jumpscareRoot: Root | undefined;

const settings = definePluginSettings({
    imageSource: {
        type: OptionType.STRING,
        description: "Sets the image url of the jumpscare",
        default: "https://github.com/surgedevs/VencordJumpscare/blob/main/defaultFiles/jumpscare-uhd.png?raw=true"
    },
    audioSource: {
        type: OptionType.STRING,
        description: "Sets the audio url of the jumpscare",
        default: "https://github.com/surgedevs/VencordJumpscare/blob/main/defaultFiles/jumpscareAudio.mp3?raw=true"
    },
    chance: {
        type: OptionType.NUMBER,
        description: "The chance of a jumpscare happening (1 in X so: 100 = 1/100 or 1%, 50 = 1/50 or 2%, etc.)",
        default: 1000
    }
});

function getJumpscareRoot(): Root {
    if (!jumpscareRoot) {
        const element = document.createElement("div");
        element.id = "jumpscare-root";
        element.classList.add("jumpscare-root");
        document.body.append(element);
        jumpscareRoot = ReactDOM.createRoot(element);
    }

    return jumpscareRoot;
}

export default definePlugin({
    name: "Jumpscare",
    description: "Adds a configurable chance of jumpscaring you whenever you open a channel. Inspired by Geometry Dash Mega Hack",
    authors: [Devs.surgedevs],
    settings,

    start() {
        getJumpscareRoot().render(
            <this.JumpscareComponent />
        );
    },

    stop() {
        jumpscareRoot?.unmount();
        jumpscareRoot = undefined;
    },

    JumpscareComponent() {
        const [isPlaying, setIsPlaying] = useState(false);

        const audio = new Audio(settings.store.audioSource);

        const jumpscare = event => {
            if (isPlaying) return;

            const chance = 1 / settings.store.chance;
            if (Math.random() > chance) return;

            setIsPlaying(true);
            audio.play();

            console.log(isPlaying);

            setTimeout(() => {
                setIsPlaying(false);
            }, 1000);
        };

        useEffect(() => {
            FluxDispatcher.subscribe("CHANNEL_SELECT", jumpscare);

            return () => {
                FluxDispatcher.unsubscribe("CHANNEL_SELECT", jumpscare);
            };
        });

        return <img className={`jumpscare-img ${isPlaying ? "jumpscare-animate" : ""}`} src={settings.store.imageSource} />;
    }
});
