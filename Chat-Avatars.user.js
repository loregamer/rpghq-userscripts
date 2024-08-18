// ==UserScript==
// @name         Add User Pictures and Add [irc] to Names
// @namespace    http://tampermonkey.net/
// @version      2.0.6
// @description  Add pictures to users in Cinny Matrix client by user ID and add [irc] to their display names
// @author       loregamer
// @match        https://chat.rpghq.org/*
// @updateURL    https://github.com/loregamer/rpghq-userscripts/raw/main/Chat-Avatars.user.js
// @downloadURL  https://github.com/loregamer/rpghq-userscripts/raw/main/Chat-Avatars.user.js
// @grant        none
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAABb3JOVAHPoneaAAA0bElEQVR42u2dd5xjd3Xov+d3Jc3ubPcWb3HvNm4YXDE2phgcU0JNIJSEhBceIYTiBEh5Ly8BUlhKgBB6MwRTbWxMC2BT3AvYa7P2uq3tXa+9692dnaZRu7/3x7l3dKW50kizmpFm5nw/H620ku5VGZ3zO79TwTAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzCMziHdfgNzmfDiN7V9jLv6s91+28Y8whRAi0xFmGcKUxrGVDEFUEcvC3oqUvcn9F4vIqYYjEmZ1wqgw8IuVL/P+msAV/ccAF93oeG193pdL/BpCkBS/qwi4D3u+5+Ztu/TmH1kuv0GZikBkAP6gGx0ezGwHFgC9EeXhdF1Fv2ug+g6ltAKUE5cxoA8MBpdRoABYBCRMaAEFIFC9HzP8DAsWqRnE0kXfsNowLz6tUxhxXeokPcDq4C1wBrgQGBddL0SWIEqgAXRJUtVMWSprv4w0QKIrz0q1EVU0EuooI+hymAfsAfYCewAHgd2IrITeAIYBsYQKeI9k1IuQyZjFsE8Z84rgDaFvg9YBhwEHAocHF0fhgr/MmApqhByVFf1gKp538nvNJbkMLokLYY8MAQMoorhMUQeArZGl4fxfjeQR6TS6guaQphfzEkF0IbQ96Er+pHAEcAxwNHAemA1as73UV3VXbc/WwoeVQxF1AIYwfvdiDwBPArcD9wD3Adsw7lhwjBsfsbIiWjKYM4zZxRAi0IvqMl+JCrsxwPHoqv8KnR1X4QK++z7buL9vwpwBd0+DKMWwjbUMrgHuAvYgvePIVIcP76RAxGzDOYqs+9HnqBFoQ/Q/fpRwInAyajwr0eVwRJU4Gc/zR2AIaoQ9qL+gwdRZXAH8Dvgkch6aPoSpgjmFrNSAbQg+IKa8McATwVOjW4fEt2/sNufYVpJWgJp9ytl1LG4Hd0m/A74DXA38DCqLJpiymD2M2sUQIur/VJ0pT8VOAld7Y9GHXhzY5XfXxpbCQOo4MeK4DfAPeL9Dl/nRPTROcR7vAjBVZ/u9qcypkjPK4AWBD+DmvjHAk8HzkIFfz3qwDOaka4QngTuBW4Dbka3CVu9yHAs9K5YJMzlAHDlMmEmY4pgFtKzCqAFwV+AhulOBZ4BnAGcgIbqjFZp7jcoo1bBLcB1wK3AfeVMZnemXMaLEDqHi4IKrlQizOUIrvxUtz+V0SI9pwBaEPzF6F7+acCzgGeiIbyg2+991lAbLWj1qN3A7cA1XuQ61ELYJd6HPs5ArPM5mEXQ+/SMAmhB8Behgn82cBFwDmrmG/tLe+nDo8Am4Mde5GfAZjTMqH6CWKk4B5UKBAHB9/6r25/QaEBPKIBJhH8hmpl3FvD7wHlozN6YDuKVfHKlUEAjBld5kR+hFsE+REK8h74+KFZTDPDeLIIepKsKYBLBz6BZes8A/hA4N/q/0SlSzPY2FEDMGCKbPHwXuBp4AE0/9mmv4Z0jc8Unu/3JjYiuKIBJBN+h4bzTUMG/CDX1ezENd3aTpgAaPT6JQvAiw6iz8BvAj3FuOyIl4qzjuuNtW9Ab9Fo5cA44DngN8BLgcCyUN31MVjXYSlVhhHi/GDjfi5wEPA/vv4r31+L9vnFrwOg5ZlwBNFn9DwQuBl6Hrv5L6BEfxbwlGS1obVvgxPtVXuRFeH8KIlcg8lVE7kZDingRdj71bMoiII7M5Z/o9qec18yYgDUR/CxwJvBG4Dmoud9rlokR06JvwOuqPwjcjnNfBa4EnvQi4AIIQwgWQFgwJdBFZkQBTLLqvxR4LXAKGuM3ZgtNlIGvPlZC5FFErga+5J37LRCCRL8+wQtkv/Pxbn+aecm0K4AGwu/QtN3Xo06+Q7FEntlHC9aAr7Yp24vITV7k0kgZ7MM57XjiHIQhPpMh942PdPtTzSumTQE0WfUXAy8A/gRN5lne7S/BmCKtbwfi55a8yD2IfBtxX/X4B3EOJIN3nmCsSKV/AbnLPpx6njM27kDQDijxdTNuvmRdt7+hnmdaFEAT4T8YeCXwajSH3/b6s5n6suNWtgTq/NvhnXzfO/cV79yNiJRxDi8On81AGLLgq/8+4RztKoBWmO9KouMKoIHwC1qh9wbgZajJb8w1Js8VqD7HuRHv3LVe3Bd8JvMT8MNhNgvi8E5TiRd+8f01x5+xcce48OfQHmjTwXxSCh1VAA2EP4fm7/8p8GKsWm/u0ooCiHEOLxLi3K0+CD7rg+B7HnaFCxYQZrIQOAg9w0cexYHveS2gCiAiQNu6HUa1UWoRbZSap9o6Pf5/gf0wGOayQuiYAmgg/IuBZwNvRkN8uW5/YKNDNOo6VP94CuOWgIia/YG71weZz4fZ7Ddye/Y+kj9oAz6TIcxmCfJ5Bo8/gXXvfFVSAWRQ/9H/QpPFyqiQx7MURqh2S96DtkEbQCsa96LdlEei57elGOaaMuiIAmgg/MuA3wP+Cq3Vt6Se+UiKIqj1BwjeOXyQeTzMZj4f5nJfyq9b/0Amn/c7zz6blbf/hqVb7mHHhS/gZaOnA5oaWtCCsDcDf4F2fKon7oEYK4bd6DyFx6LLo2ij1F3RZQBtoFpq9aPNBWWw30LZQPgPQFN534k24jTmC8lioibZgxOVQECYzQyEudyXKwv7PzW2bv2WIJ8PRw85lL4nd3HAFz/HSX95Jf1S09F8FfB24E20VyhWQa2AvVRbp9+LNkl9GFUI+9DtQ9jKCWerMtiv2HsD4V8J/AHwN2hevzGfSDr6mmwDBJDE44JHYAEiJxIESwgr9xfWHLgnt2e3zx90MMVjj2Xkvefyq18VWOzGZXIUFdxVaEu4VutGHNpRagXqkH4qWmZ+PpqVejT6O85Fz62giqDhdmHDhZew4cJL2P6TD3X7L9AWU7YAGgj/CrSQ568xT//8pI0KQqi1BKKtAGFfX760ZMk3SsuW/9vYunX35XbvruQ3bKBv1y4u/Yc/4bIPPV5/mmOB9wEvRAW7EwwAjwC/BW5A+yM+Et1fpAXfwWywCqakABoI/3JU+P8GE34jSZPtwITIgHP4TIbKwoWjxWXLv1E8YOW/5tdvuH/h9m3h6CGHsPDRR7n0aS/hsi01jYodcDrwb2j/iE7ml3h0u7AVbZD6C7TseTtqgUy6RehlRTClLcD/PeZp9Xctplb4zeE330luA5KRgknGmwtEo1J9FpGjfSZYgbhNQ8efMNC/fRtDRx/D0+6/nR/1HcZYOH6sR4em7kQrSVfRud+gUB0hdzK6TTgbLVqLlUPTMGMvbwvaVgApq38fmtzzHrQ5pwm/UUsi7Dfhofjx5PMAvEe8zwFHELiFUq7cue6SPxx6z89u4bx3vYpv33U93xyrcf6H6KpcQutMOl1YJqi8LEJb1J2O+g2ORy2OATS0OEER9LJ/oC0FkCL8GbSY52/RltzWtcdIZxKHIDUOQf2/eI+EfgHIkQSB/OWWx+9YvPWh/Ksf2kPfnr3k8yXuya1MnqqE7tMXo9Wl05V34qJzr0Qd3Wejqe39aN7BYNpBvagIWlYAKcIvaJ++v0dbdFs1n9GYSRyC9UoAkciU9EgY9iNyhHdBfujIo+8MioVS4YCVnLgq4NAlwg3DNZPeRtHQ3hGoN386FyVB+1msiF7v6eg2YSGad9BQEfSKEmhJaBs4/Y5HV/4LsAw/oxUmaziatAJEiIKF+n8fLhU4FJEdQ0cfc292aDjMr1/HuqDEffkMO0s1fr8BdCU+Fe05MRNkUEf4EdHrnoBuj3ehCUY19Io10JICSHH6rQfege79F3X1Exizi3a3Aon7xIcH4NxaqZTvv/+PL3pk7TU3s+XV53LR4C5+uDNHxY8fEaITkAVdlftn8BNm0ES4o1Fr4DA0VXknKfVL3VYEkyqAlNV/MfDHaPbVysmON4wJNNsO1CcRxcKvWwIB1uGCJUse3HnHirs37e7fWWT1LTfyln94Dp+78JLkmYqoU3A9mo0601vUDDqJ+rjoshqNGOwiJXTYLSXQfKD8ROEP0Pz+D2Apvsb+0HLvgKhgKBMQZnNUFi6kuGLFvrHVaz6RX7f+wwue3LVnbNUqMqOjjCxbyesfO7zmVdDRcR9G/VTdZCc6X/Fy4KdoXUIqM5k30K6D5Hh05T9hxt6hMfeYzCE4ocLQI2GIlEu4YoHs0NCy3OC+1/Tt2X3R0GGH5YL8GPk1BxIEwiG5Uu2BmrRzKTrxuJusQSdbvRctkDuLBqnLiarHaaehWZSy+q8E3oLm+VuvfmP/aCUqkPL8ODaAyHKfya4UuHPrSy/eser2O3jwlRfwvBUZrr6/ZqtdRqv/jkRN8W6GqgXdCpyK5hKU0S3BSP0TZ2pLkPpXSBH+LNq994PogE7D6AyTVQtGz/HO4V0AQUCYyVDpX0jhgFWFsTVrPl1cvuJ9fbuf3DW2chWZsTz5tev5o4drfqaC9qH8KHBMtz9ygs3A19BtwRai2Qn1TOeWoFVteBTat//gmf1+jDlLm9sA8R7xIfgQCUNcoUB2eKgvOzT08szo6PNGDjk0F5RKFFauBhFOXjxhKxDvv0foHY5HC+fejTY4SY2oTeeWYIICSFn9l6Jm/7lYmq/RKdobQAqAhOoLwIdIJSTIj5IdHFwf5EffmBkeOmr3aadJZniI4cMO53N/PmGtGgQuQ0eb99KosmVoHc0/o5OxUiNr06UEJrMA4v79f4jF+43poMn8wXErIB5NhocwRCoVJKwg5TKZkWHJDg2elRkdfcWyLVsWLdi1k2Wb72br53/Ml47bVX/KzcA30WYfvUQGrSv4AGppbyBFNqdDCdS8SAPH32vQ7CbD6CwtWAGSoiAkVAtAKiGuVCI7OLgoOzz8qmB09JSBE09y2aEhCmvW4jMTqoILwFXArbTY6WeGORKtqH1XdHuCk77TSqCZBRAAz0KdJ9lufzPGHCW5yk/2vORzfIhUykilTDA2RnZw8OhMfvSPsoODy1befguZoUHW3XR92pkeRrcCA93+6A1YBfwZ8I9oQdO0JjA1UwBr0dV/bYvnMoz2accPoCXC48pAwhAplXGlEpnRkVx2aOiiID969iMvfpnLDg6y/Zzz+NyJu+vPUgJ+hjb36CVfQJIlaM7A+1DnYI0p00krYFwB1Jn/8ep/DlblZ8wU9at8RM02wPtqiZD3kS+ghCsWyQwNbcgODb8it29gxaJHttL/xON4JC2Mth34Dr1rBYDWL1wA/BPwXOqs8DM27uiIImhkAawFXo7l+hvTTVLoGzQNST0m1C28eI9UKrhikWAsn80OD12QGR09Y/uzn+dyg/vYc+yx/ObK2+vPUAJ+jvb561UrALS/4TloyX3qVnx/lYCDCau/Q0N+Z2Orv9GLRFsBCeOtgEdKJYJigczIyIbMyPBL+3dsX9q/fRsHX/drhlevSbMCtgE/oLfyAtLIoXM13o0qgY7O00yzAFag3VVXd/uTG0aMpPUVjJKCYn9AbAVkRkbOzw6PnLjpdW8gu28fx/3PT7jt2gfqT1lErYAt3f5sLZBF25VfQooS2B8rwNWt/oJ6Hm3vb8w8k0QCkg7A5DHjSqBcwRUKBKOjhwT50QvX33jdwr7BQXYffjhrNm1KswLuR5XAdM0Z7STxOLR3oI1JaxbvqSqBegtgIXAhmohgGD2FTzQMrd7pIaxoRCCsaEQgn1+QKRSemxkrHHbge19H3/Awo6tTDdpRtDT3iW5/thbJoOXNb0ObktY4TKaiBOoVwMGo99+q/YyZp82Q4PhhsRUQKYFgLE+Qzx+fHRs7855vXh9kR0cZXbmKTb/cWm8FeOBO4Df0ZmJQGll0kX4r8JT6B9tVAkkFEKBpv0d3+xMa85QGYcCYCeHACYlBYZQbUCIzll8aFAoX9A0NLV28fTtLtz3C6IaD0k77JHANOgdwtrAAzRN4EynVue0ogaQCWIyu/su6/ekMoyXqlID4uE4gJBgbc5lC4fRMoXDk/a//Y3Ijo6y99mfAhPLaEjr6a3u3P06bxMN4Xo32IKyhVSWQVACHouEGc/4Z3aHN6sBxEunEagWoLyAYGzs4KJXOWLbl3kwmP8rohoO487pH087wAHAHs2cbELMK+HO0Td/CqZzAJa5PwZp9GN2k1bqAOiRpCcRbgXKZoFDoD8bGzsqMjS3p376N3J49HPTLnwMTrIAB4Hpm1zYg5nDgL9Hte83i3YoVECuAhUzPOCXDaJ80b3/8UCPlUFMjUNHswFLRBWNjJwejo+tu+MglZAf38eSJp6QdXUGzArvdN3CqnIa265swl3MyJRArgFXRScz8N2YXSfPfe/Xrhx5XKSPlMq5QOMiVyyceefmtLhgrUFi2PPUswINoXkAvpwY3IoNuA16HNvBpmVgBHIEOMLCOP0bvUD9ZOL67PgIQ4z1C1Dikog7BoFRcGhTGTpVyOZfbN0B2eKjRq+1Bw4EVZidLgTcAz6aNdGEXXY5DxxoZRneZZHx4zf31SiAqEhI0IuDKZaRUyrhi8YTs0NCSBbt2smBXtUtQnR+gANxF79cGNOMQ1Cl4ZPLOZtsAh5YdHscUvYiG0VEmyQUYf1ry+fXHx6nBlQquXJagUDgyKBRWX/Px95AZGWbzTzannTIE7kEtgdlKgKYLvx7tKTBOIyXg0JW/2/3SDUOZSigwmQsACV+AJgVJqbRawsoRJ3z7JpFyubbleC2PoZOFZ6MfIGYJ8Eo0ZXhSmXboxJKDsf2/0Qu0GQJsdA7xYbVXQKm0xI2NHZ4dHJRgbIzCmjXjT63bBuxDnYGzWQGAhgZfD9R8uDQrwKH7Bsv+M3qLtMq/JsROQR8fG6ozUMIQVy71uXL5EJ8JcpmREZZsaVgBnAceosGAjllEBu0m9EK0n0BDHBoBsJbfxpwgNmPFh9ooxHukVHJSqRwcFAr92eFhcoODjQ6voE1DZ2NCUD2r0Xb+TR2CDg3/mQPQ6D2atAiTVpKEoiEiTp2BG4KR0f4gP0qmcSjQozUBo93+6B1A0InIL0SLh1Jx6D7BEoCM3mKqdQFJfKhbgUpFpFRc6UrF/kWf/Dvc2FjDI9Ax3rM5FJhkCTrT89jknUkrwKFZgOYANOYG9RGBUJ2BrlzuR2TpXdc/OsFSqHMEDgJ7u/0xOsjJ6MixVCs/VgCG0VtMNRrg42OjceJ+PCcgB6zo37ZNJvHxj6G5ALM9EhCzCHgRddO9YisgzgMwC8DoPVpVAjXRAp0bMP6LrnYLykqlsiw7OIhUmjr5S/Te7MD95SnAc0iJCMSZgIYx66nvGejjf1QJZFyptCAzOiKuXGp2miK6DZgrFgBole+LqOv1ecbGHThUK5gFYMxBqgpBwtBJuZRzhQJSblrvU2FuhAHrv4hTgbOoc/g7rAGo0YvsTxRg3A+gi7hoYpCT0GelUlG/QGNCZkeb8HZZgTYTrSkXdlgI0OhFpuIEHB8xFl0lZ4n4UPDejdcJNCZE/QBzaQsA1UKhY0lY/I7Z1wfNmA/ESUBtKIIamyF2AMR3hj4UH5bVYThvf/IHoUNFxmcMOuamuWPMZmLBb2VSUKPjBfA+4RgMQ7wvgq+xDBrgmJt+sYVoleB4F2GHpj3ONXPHmM20Oy247jlJ7z8ieNUHoXhfigeKNsHR4QGcPYSgIcHjots4YLjb78owUmmjGrBmuyDCeD6A5gMClAn9iBf8JFuAgLldG3MgOmg0C6oABjALwJjtNNwOjN8qSlgZ8C7QxKDGZJjbuTF9qAJYCqoAZmsrZGOu0+oWIPl8SCgDqV6JFKRS2VtYvcZLpWkeQBYtopmLPgCo9gA9KP7PE1gkwOg1WhD8Rq29JPm4J/IDyJBUKsMH/vQnk1kAOTRmPpdZC5wAOIfWP5f273yG0UXSGoOOWw8exHlEngDypRUTZbuuScZC1Es+Vy0A0NTgU4AFjrnTAcWYK0wlC1BX+eQd1Uxg57wXtw2RER8Ek51/OW0O15iFZIDjgWUOHYxokQBjTuFFNA7gwTtXQXjUi+S9c826AgvaIGeut8gTtHHoWoe2Qd7d7XdkGOO0E/5LJeE8FAHn8og8DFQQ0VZhDQ/kIOZ2FCBmFXC0Q4X/ISwUaPQa7eQAJA8b7wwK0Yq/D3jAu8ADhAsbhvmz6IDNhj305hBLgOMd2vzgXmbvTDRjrjJFX0DNcYGDaODHoq0PeAApVX3edQ7AxWgX3flQINcHHO7QmWibMT+A0Uu0KvwNn+dBHF5cCNyLyN7CqjV4EZZ/6J2NzrYcbZ01lyMAMQ44zOk3xWYsIciYA1QdfIJ3DkQKwF0ehnEOHzRc3AU1/9d2+zPMEAIcEs8O24ZuA8wPYHSXFrP/Uj35yWOj/T+wB+9/gwsqAGE22+iUDi2UWd7tr2CGEKIoAGgb5NuwhCCj28SOv6lGAiIl4J0D5zzCAxKG9y299WYP4MrVhqB1+/9+4CTmhwMwZkGsAIrAzczu0cjGXKOBJTBh9Y+TgCaY/1Q8chsiu/JHHhVbBI1Yg/bQnw8OwBiJvxEP/A7Ysh8nM4zO0arwpz3HiToAkQGE673ImA8CwlyO5RvfkfpqaIHMod3+2DNNUiU+DlyPdQgyZhmxUtAYn2iJi1YA3ou43y6+444Q53CNw3854HTmfhHQBJIKYAz4BbCr22/KMFrFT0gCGt8OFL1z13mRx/LHHot3rlkV4CrgbCYZpT0XSSoAD2wCfotFA4xuMaGmf5LnJhWASLSrFby4nTh3bZjL5X0QkD/oIBZ/8u9Sz4KWxp7A/Ij/11DvFdkJ/A+WFGTMNCmOvbafHxf6iITeuVu9c79dsPMJ7zMBC3ZUTf46878POA9Y3e2voBs4d/Vnk/8vAdcC93X7jRnGpCSUgJr+up55J4M490MfZHaVFy0izDa17DegCmBeDshJi4vcD/wUTRE2jJmhnZh//eqvMf/Y8edx7neI/LJ/64NlXIBUKiz5z78FJqz+Aer8O6HbH79bOIA6K2AUuBrY2u03Z8wjJtn7+2TDD6kt961J/w3cqHfBDzxsLa5aTdh8uMgy4PnMQ+9/TJoF4IE7UCvAQoLGzNFKGvAEp19N8o/HBZsRudr39Y3hBAlDLvn11cCE1V+AE4FzmV/JPzU0So0aBL6LtgszjM6Ttpo3oCbUl0gR9vFjIngn+CAY9c5d5eHeYGQYjyqAT995fdpp+4GLgIO7/VV0k3EFULcN8GhtwA8xX4DRS8QCX684XOB9EPzOi1zpA5f34mBkmDCnDsCU1f9Y4AXMU+dfTLPk6EHgMjQ92PICjM6yHy2/0pJ/wkwwiMhlAve4chnBQ/8iFn/6/7DkiLPqT7EAuBg4pttfQ5cpNlMAHrgT+DqWF2B0kjYGfvhm+QFx2m+QCRF3I8KVYTYzVn/u499yef1pjwFexNweATYZHniiRgHUbQMARoDvoDUCNjzE6C71Hn9x2vPPyU7gUuDhID9WfX569V8/8FLmaeZfAg9scy088SHgS2ixkGG0T/0q3q75H1sMNXt+wQcOL64IfA/4aTCWr+ln0f+Ff67f+4N6/l/C/Oj824wQeGiCAkixAkrAz9Ev2cKCRvs0HNzZQsivQecfXfkdaMj6y+Iru0KXIXZX+fTFfRnwB6gDcD6v/qDO/ftbsQBAKwS/jDYNMYz2aBi7TydO+vFp56gRfnkS4ct4fus9YbLar/+L70vz/J+D7f1jhoHfpSqAFCvAo1WCn0MHiRhGe7RT5dfg2HHBj8p9gStQyzQvlZB49V/4xfenmf7rgdeiE3EMXdTva2gBpCiBAvAD4FtourBhtEYs9O0m/dTdn3AAepAbEb5AINvBay5fpBxShD+HrvzPRefizXc88CDwWKtbgJh4K3ANNkjEaMZUhnqknSPeCiQcgd7JQ17kc4jcRtl7HfcFeFjwlX9NO9Mp6Oo/L0t+UygDdwEDTRVAihUAcDfwX1jjEKNVphLzr8/4qz62G5GvIvJ9wrCIqxb79P33B9NW/zWo8D8Nc/zFDKHO08KkFkCKEqgAPwM+jdUKGI1Imv1TPUV9xZ+4US/uSi/ui65c3isIUqkAHpxLE/4+NN33Zcyvdt+TsR1tAuxb2gKkKIEx4NvAV7HJwkZMM2GfzPlXXxw0sdVXyTv3S5z7RO7Oq7eGmYDs7scoL14CEvDMp04Y9yWo6f9naNMPQwnRDN/t0LwWYDL2Ap8FLkfrBgxDaTS1pwk++Zy62n/vXMUH7nbv3EfCIPht8ZSLAUdhzcFIqcQzT0ud9bcBFf4zMdM/yShwA7oNaF0BNPAHPAJ8CK0atMjAfCc51afF8V4+fZ+vqPCHPgg2e3EbEa6RMAr2e71a+JV/STv1EuCVqOk/7zr9TsI24CbUEdieBdBACdwL/CsaGbDS4flMmunegNRwX6Q4qjX+znsXPITIRxGuFu9LybV8wdf+vVHI79nAm4GV3f5KeowKcCsaAgSmsAVokCS0CfgAcB02X9Bo1/FX19wTTfjxiDyMyEc88s3c4EDeU90a9F32oTThd+h4r3cAR3b7a+hBBtG0/n3xHfvjA0hSAW4B/hHtKmxKYL6xv3H/6kDPWMgfBT4E/mthkB0qLV4GCNLcmXgY8E503z9v23w1wKPW+vUkcnimpAAabAVK6N7in1AtU27nnMYsZIpVfvXx/qQfIHrsYeCDeP7bVcKBoFwge+0DxGknfV//UKN4/18Av4eF/NIoon0+H0neOWULoIESiKcMvw/4EaYE5hetWAHJcF8yt7/62BZE/gX4eiWX2RM6IQwylM6PUvg9acK/FHgj8Bq04s+YyCPAj9EQ/jj7tQWYRAl8AM0VyHf7kxvTQJtNPSd4/FPO50XuQOT9wDcR2R0US+CEoFD9zT7z6ZfUH7kQeDUa8lvb7a+lRymjVvndJLJ3b75k3f77AJoogVuAf0ebiQx0+xswOkQb7byggbe/1tyPR3ldh7gPgFyB93vj7YSUdbua++ZH04Q/h3b3eQtwRLe/mh5mO3AlCedfTEecgA2UQBmtF/gY8CngsW5/C8Z+0gFHX8y4JeDcmHfuKsR9wAfu+/hwEBf576KWXtnvfDzN7M8CLwTehnb5sWSfdMpo6v7NpLT16+iXFl78pkYPHYp2Ynkd+scyZhtTEP4Jq38k0OOhPpE9wBXeuc/7TPZmVy6Vw0wWVy7hM31IucAzznxP2qmzaI7/XwPPoHPRrLnIQ8BbUZ/cuAK4+ZJ1QIe/uAaWAKhX93PAB1FtNNbqOY0ZJq0Lb5vCX1u7T83k3oTw34/IZxD5cHbTg9dLpVx2o0NIpYyUy1AuNhL+HPA8NNZ/Dib8zSiign8jDZr6TovZ1MQSyKGTWP8EuBBY1e1vyEghOU9vqvv9lFAfAM4VvMhtiHwN+K6Hx3FOXVPx6zrHuaf/td4F49doeO/ZaKz/Akz4J+NOdIv0S+qcfzHT0h0ltgRSFEEci9yBJnq8GDh6ut6HMUXScvknye9v1Mmnrqb/SS/yC+CLeP8zRMYE8N6PC3os/FBdnZw+1g88BxX+8zDhn4xBNAp3K036dky746SJNXAA2qbpteiIZovfdptk3779UQCJbUMk/CUvcj/OXYnIpftOP+vuZTddj3gfNfesAAHZb3+MMzfuqFn5I5agZv8lwFmYw28yQnShfRua/TdOcvWHGfoimyiBADgN3RJchJZwZmf0q5rPNBqdvb9mf3XV94gMeJFbEfcVH7irpFTe54MAqZTxQYCEIYjwzLPeQwWJV3s9jd5egXr734nW95vwT8424D3AN0gk49ULP8yQ6d1kSxDXEDwM3I5mcj0VtQbsD90NWizjTT2mJrbvCt7Jw4hcCVzqRe4m9BWfyYD3+GwOfMhAWOFFz/h7AFxC9EU7f64GXoE6/I7q9lczSxhFOyX/mBYycWdcyJpYA1ngOFQJvAxt32zWwHTRCUdffGzS3IcKInu9uF/h5CvANeD3QbXYh0pYt9f3eAQXXQPO69juNwJ/inX0aZUK8Gvgr1AHYKrjL0nXVtkGikDQvO4LgH9ArQGzBDpFo+Kd/TH5q8LvERkFNiFymRf5HsijPnAVCUO8CJte/l5O+s6/gAs47/RLCFP+tILPeOQ49Ef8CmB5t7+2WcRW4N1ol67xitxGwg+95333aLrifVgh0fQz1W690XUitFfyIvcBl4uG9u5BJA94CUMyFSgHnpO+W9uy2wNBtOp7wOH7PHKewNs9nA8s6vZXNIsYQnt0/oQ2yvG7pgDc1Z9tZAXk0BwBm9/WKWJzv8VWXTGNzP1En/6KF/cgwo9ALke4wyP7pFyq+CAYP6Yc3wxDzj3rvXobT0CNp3+FR16OdvI5Ee3oa7RGCbgandmxr50Duy5gKUrgeOAzaIpn19/frKfe0z+VVT8+rurdrwAPIfITL3IVIncAT0qlUvIugMBBpVLz2nE+vwb84DyG+RWLGWQpSxk8Ft3rvxw41Fszj3bwaKLPe9F8/5qBPc3Mf+gBAatTAH3o3u/vUF+A0SodCOlBbS/++Dqx4hcQudfDz0F+hnAnIo/jfXHcHxCF9TKjecr9C/HiOPfMd6e/Zc3suwAV/vOBVTZppm02o/LyA+p6ck4m/NBlH0DK6n8M8Pto4ofRDvWr/BSGcNYIf20izz5ENnmRa4BfI7LZB8HjrljUFT/5epkMVELKi/rJfus/OGPjjpp03sT1IWjn3lcCJ3ub2DsVtgOfROtrptSQt5ecgAvQhA8r7WxGLGz11/Fjyee1QBMHXxnYhsjtiNzgRW5B5B6fCXZJqRxKpUKYy2nhDlrgQxhCpUL22x/jjI07eEpUzBOrokj4F3ot4vkDDxeKVooa7bMTnc71LVLmcrSy+kNvhQFPRfsGnNmt99TzdGLgZoIGK/6TiNyHyO1oktYdXuQhKVf2+Yyu9uELno/70Y9BBBHBhx6E8RU/jQCoaKfei9EmHqdjXv6pMoBW136cuh5/0LrwQ+8ogIXAu9D0RftRJHPyk//fTxo49kJgwItsBTajbbnu9M79LsxmHwvy+cp4Ak8iiuAKBcK+Prxz5L750YaCDyCwIlr1XyzwfG+r/v4wCHwdHchzX/2D7Qg/dEkBpKz+p6HmzNO78X56iiYDM6ZCg7TdAiIDwDYv8gAid6PTYn+HuEfx4ZiPmneE/f24kZGqlZDw6gNNBR9V7MejYd2XoH9nm9QzdfYB3wU+jI73rqFd4Yfe8AEsQqsCT+j2G+kqzQR8CoM2fO3/S8AIsNuLPIbIg8C9IHci3OuDYJsrFsd8EIzX48e40VF8Nosrlwmj1R7gzI07CKk69hI1+wBZgUO8hnJfAjwLrf40ps4AmuHXMeGHLiiAutVf0BXiJWi99/wi6cjbTxIrfQUoITKMmou7gO2IPOh1pd+MyNYwk33SFQsVxCFhWHXoJd6ThKGa+N/4yPjrxCu+Zu5FH4NxRZABDgRO8+rQfQHq7R9/noX5psRe4ApgIzrWu4apCj903wJYhAr/cV1+H+2QrFZtTP0+Pnn/FBJz6t+D1717iDZZGUOrwAaAXYjsQOQBtBb8QS+yDdgplUoxXuVduQSZLISaNyJhiA8CXBgSihs38aGxmZ/4IjJeV/iT0LLuF6KNXlxS6E34p8Quqiv/vfUP7o/wwwwrgJTV/wS0K1Cvx4A9KmgDVLsbLwEWo3vaDOro1otI1P3Sx9Kt1/VJNumvk5SXEK2JqADlKDSXR/eCA9HlcUQeBh7C++2R8O/E+2GgXNOJN6iL2UdJO/GKnxR6UMF3NGgmp2SA5R6eggr+xWgK93gVpwn9lPFo56yvAf+JlszXsL/CDzOoAFIcf4vQcNAxM/UepvK20dV1B/AbtMvK7dFjK9Dps2uAlYisAFbg/XK870cVQxaRHN5nEAlQRRDUnT9EBTxezePLGDDkRfaI93u8yG5gN/Ak8W3v9yAyikiJX/+6xDnnVM/cxLJwlQphJkPm8k9MeCyZrhu/wRSyaJXeSajQPx+t17f8/c4QogL/aeALqBVQQyeEH7q3BRD0x/MienOOWwWtrtqC5ln/FPWS744cavHqKeh3WLUARDJ43xd9rgV434dIbCU4ahVALPjxKj8WXfJepBDfH638sRUQAtUhmSJQLFIj/Am86EBNL0Lmik+mPueMRBsuojdav3JHpnwWVXhPRwX/fDSkZ4LfOcroPv8/gO+QUtzTKeGH7imAxWjhR6+NcC6jJv7twP+gzRUeBoZRQfV1sXkPlPC+xIIFKoj6eNXkr24DWsHDuEPPh1Er7WyxiI9uS+w0TFb45XIQBFDqzFDmpPBn9EtZ6HXyzjmoY+90VBHk6GIuyRxkDJ2u/VH0tzcy3S84IwogZe9/Kr01xXUYXe2vBa4BNqFm1xhNt8BUTe1CTSq2ypAqg7a3wfGK7UJ96TAIqsLfiLj6LlIMwZWfavjUM+tW/LoQXkwAHFiGk9Ew3rmomb8CtQRM8DvLHrSH32dQC6CY9qROrv7QHQtgCbr6d3uWm0dX+5tRob8J7agywIoVRfbubfEsDSrwplCM04wa4Y9uB1d9uqVj6zvt1jXdrHkZdFbDccDZaAfeE9DQ3hKsTHe62Izu9b+NtsuvpD2p08IPM6AAUlb/01Azslv7xhF0tf9VdLkLVQSxmQ9791aLW6DGU+6+/5kuve3WSKu+g5pY/ThRIk8Wbb55NPA0tA3bCWgfvuXY/n46GUH9S19ETf7daU+aDsGPmWkLYCna5+2wGX7deLW/DbgOHZZwPyJP4H16GWVYtfx7SejP3LiDx1nLWh4nme/nExZ5HD+sX66jZztUsNcBx3kV9hNQi2wDGs/v9bDsXOB+1OT/Lmryp47Lm07hh2lWACmr/9PRvPCZWlVG0IKJm4Ab0E6pW6lU9hI0sGZ7YLU/a2P6IOVYyNexgwwVyg0s8jjWWAIymmG5BFiLdto9Cl3tD4v+fyCqECxHf2YYRCNL3wR+jtb0pzLdwg8zawEsJ2r5NM2vE6Jx+03o/v5W4G50WII6VoJAV/gUJdBLq309yRW/FP3p+ihKkWzWQy7qsLMczU9YlYV1HtajK/t6r6v+WtSRN/9Sr7tLCd1ufh/t3nMHmtQ1gZkQ/JhpUwApq/8Z6Oo/XSvNMDoK+bfEgi+yhTDcU5OBFzvT4vLWiCaTjbuJoPvztdHtDJD1SA5YAH5RkewSjywT/HKQAzysFFjtYbXo7WUeloo58LrJCNq081vAL0hJ7ImZSeGHaVIAKVl/B6Cr/yHtn60pFbQzyhZ0f38TGsN/GI3PV515KZ10enm1T7Ae7Zl3EPr3ioSffpB+r7cXgSzS+3BJR5/l4fcEY8AP0f1+alh5pgU/Zia2AA7t8vM8OjfpZxjdO21Ghf461Lyqxu6SiTLJ8tbZIfQxHo0PCxqLX97uwUZPsAjNp1iK1m/U0C3hh2lQAE1W/4P289RlVMAfRvPyf4ma+g+RNgghudp736smfis8gmaGgY5M696vxZgqC9C096vRnJNxK6Cbwg/TbwE4NJnkuVN8LY86Sp5ESyGvQwX/DnRlbP7is2u1n/j+CQlxCP5+j/wbGid+FRqya+hLsbr7nuRQdCH8DYnf7hkbd3RVCXQ0nTNl9V8DfBAd+NmOAqhQNfNvQ9se34iu9sVmB87ilb6GszY+hkfGB2dGEYClHrkYeAMaUl1BtS9HDU2y/Yzu8RA6+ein9IgVMJ0KIEAbQ3yC1sx/LazRPdK96Er/c3S138skOflzRfCTnLlxB3XNvfBIgMbxX4mWUx9N5PyrfZ7Rg5TQ8V3voS7rr1tKoGMKIGX1PxD4CGqyNgtBedRL+hgas/8xcD2aE52nyW95Lgp9PUlLIIlXr//JqJK9CDjaQ79EisAUQM/yMPC/0d95162A6fIBBGj12Pk0Fn6PZkVtRlf6n6MJO3tQTWm/4QTJ7QDAWvaMPM4BN6Hf2RXAswWeA5zkNXfA4v69yXp0UbwF9W11lemyANYCH0O91vU/xDK6t78B9YjeiHq6h2lxJPh8WPnrObNBX75IKQToNmAtcGo0WvsM4HA0CuNafR1jRngUeCuaFdhVK6AjFkDK3v9ZqAWQFP4hdLW6Fq18uhvNiMozWc0981Pok9x0yboJjkEYrw+IOxgNoz+uXxEV+6DNO56GRg5WYoU+vcA61IdzA02yAmeCjlgAdQpgA+r4+31UsLehyTq/QuP2W1GnXnGy8853oW9EfckvpDb1EGCB1+Shtagj9mi0B+NxqHWwHC0UsuYeM882dBL2FXTRCui0DyCLxvxPRPc410eXu1Czf5AW9vYm+M2JfyRnbXyMMLIIpK4cmGoORR4tjroLVcLLUAftOlRZH4oqh0PQ/ely1EpYgCmG6WQtagVcBzzRrTfRaQtgSfShDkCLcu6NPpyt9tNMfdefmCZtvZ1Av9f+jMvRTkCrUy6r0K3DCvTv24cq+izdnysB1W7Kheh6MbNnm7MdeAfa/LMrVkCnFUAfuorsJSXnuR4T+ukhredfzCIad5qMlEcf6lDsR4VpBaoglqMKYFl0ieciLI5OuyBxySUuSWURoDopblCUfOlkx7L4LVeoFe54AMpIdBlCf2t7ossIasmcjnadXktvWzEVVPjfjlpp48yUEui0Bi+g2U5NMcGfXm6q+/EkfQbN2sxGUleILmlNER2qIOItQl/d/+PreiUQt0WPlUB8nRycEk0Qr5mTUIrey1jieji6jKDKYDRxu4gqrGPRTMnT0VyJI1BF1WsEwDPRqM23aNALcDqZDidgKib0vcUkU32ng/i35pg4H0Go7lY8KghxZ7NJI0QNyKH+jVPRepTTUMWwht7KkQjR0V9vRx2D48yJjkAm+L1Jsx/XNCmHpFmvA0ynlyLaDu4+NPf+RHRa8enoKLMN9IZV4KgmzX2DFnNhOkUv74+MHqYLFkQnyKDhzzOA89AOyIeh24ZuOjRD4CrgbWhS3DjTbQWYAjDmHC0qpxVUh56cg24PVqN+jG7IxZPAu4Cvk7COTAEYxn7QgjKIfQXnAM9GsyYPQiMbM2kVhGiz0LdSNwl4OpWAKQBjXtCCIhA0f+VkVBGcj2ZNzuQotN3A3wCXMkNWgCkAY94xiTIQdBtwMGoVPBf1GWxg+rMjQ3Qo7ZvRlPlxpksJ9EIml2H0Eh7NKdiC5rT8AI0gPAsttz4OTYqaDkXg0CjFhei4sOmOlJgFYMxf2ohkZNCQ4cFoh+vnoLkFcav2ThKivTHeDDyQfGA6rABTAIZBy8rAoduD1cDxaCjxfDSvYGkH385e4B/QUeHT6gswBWAYdbSoDHLoVuBwNO04bsJyEPufaejRvhlvRrci43RaCZgCMIwGtKgIBC2M2oBOWT4nujwlun+qDAD/CPwXiWpaUwCG0QVaVAZZtNfCMWg+wdloDcJUrAKPdsZ+M3BP8oFOKgFTAIbRJi0qg+Xo9uAUdGtwOqoY2vEVDAL/D/hPtBoSMAVgGD1Bi4ogg24PTkKVwNPRsOJ6Jo8geLRj0JvRHprjdEoJmAIwjA7QojJYhtYcnI5aBaegVkIzq2AI+Gfg42g/BMAUgGH0JC0qggDNKXgaWqJ8GnAU2qsgbYL2DcCfA5uSd3ZCCZgCMIxpokVlsBSNGJyDKoMT0O3BYqryOQK8H50SnY8PNAVgGLOEFpRBgPYzPAO4ALUKDkOdiVl0bN6b0FmZHkwBGMasow1fwVPQ5KLz0azDftQC+ChRa0dTAIYxi2lBGWTRHIKz0fqDDLoV2AKmAAxjzjCJMnDoVuAwdJTYNsB3QgFYObBh9D4hOvdggNq5CfuNWQCG0UO002zVtgCGMYeZTBmYAjCMeUAjRTDTk4QNwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMwzAMw5iM/w8OY3myB3+tvQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNC0wOC0wOVQyMTo0OTo0MSswMDowMNbupocAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjQtMDgtMDlUMjE6NDk6NDErMDA6MDCnsx47AAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI0LTA4LTA5VDIxOjQ5OjQxKzAwOjAw8KY/5AAAAABJRU5ErkJggg==
// @license      MIT
// ==/UserScript==

/*
MIT License

Copyright (c) 2024 loregamer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

(function () {
  "use strict";

  // Load saved userPictures or use the default if not found
  let userPictures = GM_getValue("userPictures", [
    {
      userId: "@irc_Gregz:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=87",
    },
    {
      userId: "@irc_Kalarion:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion1:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarion7:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Kalarionis:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=71",
    },
    {
      userId: "@irc_Tweed:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_Tweedagain:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=68",
    },
    {
      userId: "@irc_WhiteShark:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=63",
    },
    {
      userId: "@irc_decline:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=225",
    },
    {
      userId: "@irc_Norfleet:rpghq.org",
      baseImageUrl: "https://i.postimg.cc/T2z1mDLK/image",
    },
    {
      userId: "@irc_Sex_Cult_Leader:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=65",
    },
    {
      userId: "@irc_stackofturtles:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=3301",
    },
    {
      userId: "@irc_twig:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=2",
    },
    {
      userId: "@irc_Roguey:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=86",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_Chonkem:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=69",
    },
    {
      userId: "@irc_herkzter:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=289",
    },
    {
      userId: "@irc_The_Mask:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=113",
    },
    {
      userId: "@irc_Eyestabber:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=85",
    },
    {
      userId: "@irc_wraith:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=62",
    },
    {
      userId: "@irc_rusty_mobile:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=58",
    },
    {
      userId: "@irc_[Classix]:rpghq.org",
      baseImageUrl:
        "https://rpghq.org/forums/download/file.php?avatar=3607_1722022475",
    },
    {
      userId: "@irc_wunderbar:rpghq.org",
      baseImageUrl: "https://rpghq.org/forums/download/file.php?avatar=90",
    },
    {
      userId: "@irc_tars:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/Zuzzdn8HsDAA.png?n=pasted-file.png",
    },
    {
      userId: "@irc_Ammazzaratti:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
    {
      userId: "@irc_Dedd:rpghq.org",
      baseImageUrl: "https://f.rpghq.org/SUqopfrg82m2.png?n=404.png",
    },
  ]);

  function setImageSource(img, baseImageUrl) {
    const extensions = ["jpg", "jpeg", "png", "gif"];
    let imageSet = false;

    extensions.forEach((ext) => {
      if (!imageSet) {
        const imgSrc = `${baseImageUrl}.${ext}`;
        const testerImg = new Image();
        testerImg.src = imgSrc;

        testerImg.onload = () => {
          if (testerImg.complete && testerImg.naturalHeight !== 0) {
            img.src = imgSrc;
            imageSet = true;
          }
        };

        testerImg.onerror = () => {
          if (!imageSet) {
            img.src = `${baseImageUrl}.jpg`; // Fallback
          }
        };
      }
    });
  }

  function addUserPictures() {
    const allUserElements = document.querySelectorAll(
      "[data-user-id], .profile-viewer__user__info, .prxiv40, ._13tt0gb6"
    );

    allUserElements.forEach(function (element) {
      const userId =
        element.getAttribute("data-user-id") ||
        element.querySelector("p.text.text-b2.text-normal, p._1xny9xlc")
          ?.textContent;
      const avatarContainer = element.querySelector(
        "span._1684mq5d, .avatar__border, span._1684mq51"
      );
      const displayNameElement = element.querySelector(
        "span._1xny9xl0 b, h4.text.text-s1.text-medium, p._1xny9xl0, span._1xny9xl1"
      );

      const user = userPictures.find((user) => user.userId === userId);

      if (user && avatarContainer) {
        if (!avatarContainer.querySelector("img")) {
          const img = document.createElement("img");
          img.alt = user.userId;
          img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
          img.style.width = "100%";
          img.style.height = "100%";
          setImageSource(img, user.baseImageUrl);

          avatarContainer.innerHTML = "";
          avatarContainer.appendChild(img);
        }
      }

      if (
        userId &&
        userId.includes("@irc") &&
        displayNameElement &&
        !displayNameElement.textContent.includes("[irc]") &&
        !element.classList.contains("_13tt0gb6")
      ) {
        displayNameElement.textContent += " [irc]";
      }
    });
  }

  function addSidebarNames() {
    const sidebarElements = document.querySelectorAll(
      "[data-user-id], .prxiv40, ._13tt0gb6"
    );

    sidebarElements.forEach(function (element) {
      const userId =
        element.getAttribute("data-user-id") ||
        element.querySelector("p._1xny9xlc")?.textContent;
      const sidebarNameElement = element.querySelector(
        "div.prxiv40._1mqalmd1._1mqalmd0.prxiv41.prxiv41s p._1xny9xl0._1mqalmd1._1mqalmd0._1xny9xla._1xny9xlr._1xny9xln, span._1xny9xl1"
      );

      if (
        userId &&
        userId.includes("@irc") &&
        sidebarNameElement &&
        !sidebarNameElement.textContent.includes("[irc]")
      ) {
        sidebarNameElement.textContent += " [irc]";
      }
    });
  }

  function updateProfileViewer() {
    const profileViewerElements = document.querySelectorAll(
      ".ReactModal__Content .profile-viewer__user__info"
    );

    profileViewerElements.forEach(function (element) {
      const userIdElement = element.querySelector("p.text.text-b2.text-normal");
      if (userIdElement) {
        const userId = userIdElement.textContent;
        const user = userPictures.find((user) => user.userId === userId);
        const avatarContainer = element
          .closest(".profile-viewer__user")
          .querySelector(".avatar-container");

        if (user && avatarContainer) {
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = user.userId;
            img.style.backgroundColor = "transparent";
            setImageSource(img, user.baseImageUrl);
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
        }
      }
    });
  }

  function updatePingUserBox() {
    const pingUserBoxElements = document.querySelectorAll("._13tt0gb6");

    pingUserBoxElements.forEach(function (element) {
      const userIdElement = element.querySelector("p._1xny9xlc");
      if (userIdElement) {
        const userId = userIdElement.textContent;
        const user = userPictures.find((user) => user.userId === userId);
        const avatarContainer = element.querySelector(
          "span._1684mq5d, span._1684mq51"
        );

        if (user && avatarContainer) {
          if (!avatarContainer.querySelector("img")) {
            const img = document.createElement("img");
            img.draggable = false;
            img.alt = user.userId;
            img.classList.add("_1684mq5c", "_1mqalmd1", "_1mqalmd0", "awo2r00");
            img.style.width = "32px";
            img.style.height = "32px";
            setImageSource(img, user.baseImageUrl);
            avatarContainer.innerHTML = "";
            avatarContainer.appendChild(img);
          }
        }
      }
    });
  }

  function addReplaceAvatarButton() {
    const profileViewer = document.querySelector(
      ".ReactModal__Content .profile-viewer"
    );
    if (profileViewer && !profileViewer.querySelector("#replaceAvatarBtn")) {
      const replaceBtn = document.createElement("button");
      replaceBtn.id = "replaceAvatarBtn";
      replaceBtn.className = "btn-primary noselect";
      replaceBtn.innerHTML =
        '<p class="text text-b1 text-normal">Replace Avatar</p>';
      replaceBtn.addEventListener("click", handleReplaceAvatar);

      const buttonContainer = profileViewer.querySelector(
        ".profile-viewer__buttons"
      );
      if (buttonContainer) {
        buttonContainer.appendChild(replaceBtn);
      } else {
        console.error("Button container not found in profile viewer");
      }
    }
  }

  function handleReplaceAvatar() {
    const profileViewer = document.querySelector(".profile-viewer");
    const userId = profileViewer.querySelector(
      ".profile-viewer__user__info p.text.text-b2.text-normal"
    ).textContent;
    const newAvatarUrl = prompt("Enter the new avatar URL:", "");

    if (newAvatarUrl) {
      const existingUserIndex = userPictures.findIndex(
        (user) => user.userId === userId
      );

      if (existingUserIndex !== -1) {
        userPictures[existingUserIndex].baseImageUrl = newAvatarUrl;
      } else {
        userPictures.push({ userId, baseImageUrl: newAvatarUrl });
      }

      // Save the updated userPictures
      GM_setValue("userPictures", userPictures);

      // Update the avatar immediately
      const avatarContainer = profileViewer.querySelector(".avatar-container");
      if (avatarContainer) {
        const img =
          avatarContainer.querySelector("img") || document.createElement("img");
        img.draggable = false;
        img.alt = userId;
        img.style.backgroundColor = "transparent";
        setImageSource(img, newAvatarUrl);
        avatarContainer.innerHTML = "";
        avatarContainer.appendChild(img);
      }

      // Refresh all avatars on the page
      addUserPictures();
      updateProfileViewer();
      updatePingUserBox();
    }
  }

  function makeProfilePictureClickable() {
    const profileViewer = document.querySelector(
      ".ReactModal__Content .profile-viewer"
    );
    if (profileViewer) {
      const avatarContainer = profileViewer.querySelector(".avatar-container");
      if (avatarContainer && !avatarContainer.hasAttribute("data-clickable")) {
        avatarContainer.style.cursor = "pointer";
        avatarContainer.setAttribute("data-clickable", "true");
        avatarContainer.addEventListener("click", handleAvatarClick);
      }
    }
  }

  function handleAvatarClick() {
    const profileViewer = document.querySelector(
      ".ReactModal__Content .profile-viewer"
    );
    const userId = profileViewer.querySelector(
      ".profile-viewer__user__info p.text.text-b2.text-normal"
    ).textContent;
    const newAvatarUrl = prompt("Enter the new avatar URL:", "");

    if (newAvatarUrl) {
      updateUserAvatar(userId, newAvatarUrl);
    }
  }

  function updateUserAvatar(userId, newAvatarUrl) {
    const existingUserIndex = userPictures.findIndex(
      (user) => user.userId === userId
    );

    if (existingUserIndex !== -1) {
      userPictures[existingUserIndex].baseImageUrl = newAvatarUrl;
    } else {
      userPictures.push({ userId, baseImageUrl: newAvatarUrl });
    }

    // Save the updated userPictures
    GM_setValue("userPictures", userPictures);

    // Update the avatar immediately
    const avatarContainer = document.querySelector(
      ".ReactModal__Content .profile-viewer .avatar-container"
    );
    if (avatarContainer) {
      const img =
        avatarContainer.querySelector("img") || document.createElement("img");
      img.draggable = false;
      img.alt = userId;
      img.style.backgroundColor = "transparent";
      setImageSource(img, newAvatarUrl);
      avatarContainer.innerHTML = "";
      avatarContainer.appendChild(img);
    }

    // Refresh all avatars on the page
    addUserPictures();
    updateProfileViewer();
    updatePingUserBox();
  }

  function observeProfileViewer() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const profileViewer = document.querySelector(
            ".ReactModal__Content .profile-viewer"
          );
          if (profileViewer) {
            makeProfilePictureClickable();
            observer.disconnect(); // Stop observing once the avatar is made clickable
            break;
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Modify the existing observer
  const mainObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        const profileViewer = document.querySelector(
          ".ReactModal__Content .profile-viewer"
        );
        if (profileViewer) {
          addUserPictures();
          addSidebarNames();
          updateProfileViewer();
          updatePingUserBox();
          observeProfileViewer(); // Start observing for the profile viewer
        }
      }
    });
  });

  function initializeScript() {
    addUserPictures();
    addSidebarNames();
    updateProfileViewer();
    updatePingUserBox();
    observeProfileViewer(); // Start observing for the profile viewer
  }

  // Run the initialization
  initializeScript();
  mainObserver.observe(document.body, { childList: true, subtree: true });
})();
