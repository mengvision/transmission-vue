<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppConfigurator from './AppConfigurator.vue';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <router-link to="/" class="layout-topbar-logo">
                <svg width="54" height="40" viewBox="0 0 54 40" shape-rendering="geometricPrecision"
                    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="slice-9klv-r">
                        <path
                            d="M5.85884 1.45161C6.1038 0.592481 6.88882 0 7.78219 0L38.2178 0C39.1112 0 39.8962 0.592481 40.1412 1.45161L45.2734 19.4516C45.6376 20.729 44.6783 22 43.35 22L2.64996 22C1.32165 22 0.362392 20.729 0.726608 19.4516L5.85884 1.45161Z"
                            shape-rendering="geometricPrecision" fill="#EEEEEE" style="fill-rule:evenodd"
                            transform="matrix(1 0 0 1 1 16)"></path>
                        <path
                            d="M7.78219 -0.5Q5.89536 -0.5 5.378 1.31451L0.245771 19.3145Q-0.0956818 20.5121 0.654495 21.506Q1.40467 22.5 2.64996 22.5L43.35 22.5Q44.5953 22.5 45.3455 21.506Q46.0957 20.5121 45.7542 19.3145L40.622 1.31451Q40.1046 -0.5 38.2178 -0.5L7.78219 -0.5ZM1.20744 19.5887L6.33968 1.58871Q6.65009 0.5 7.78219 0.5L38.2178 0.5Q39.3499 0.5 39.6603 1.58871L44.7926 19.5887Q44.9974 20.3072 44.5473 20.9036Q44.0972 21.5 43.35 21.5L2.64996 21.5Q1.90279 21.5 1.45268 20.9036Q1.00257 20.3072 1.20744 19.5887Z"
                            stroke-dasharray="" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="1"
                            shape-rendering="geometricPrecision" fill="#616161" transform="matrix(1 0 0 1 1 16)"
                            fill-rule="evenodd">
                        </path>
                        <g>
                            <path
                                d="M18 3.59501e-14L36 10.7937L30.24 10.7937L18 3.45397L5.76 10.7937L2.35811e-13 10.7937L18 3.59501e-14Z"
                                shape-rendering="geometricPrecision" fill="#43B783" style="fill-rule:evenodd"
                                transform="matrix(-1 1.2246467991473532e-16 -1.2246467991473532e-16 -1 42 36)"></path>
                            <path
                                d="M12.24 -8.2349e-07L24.48 7.33968L18.72 7.33968L12.24 3.45397L5.76 7.33968L1.4948e-13 7.33968L12.24 -8.2349e-07Z"
                                shape-rendering="geometricPrecision" fill="#33495D" style="fill-rule:evenodd"
                                transform="matrix(-1 1.2246467991473532e-16 -1.2246467991473532e-16 -1 36.24000398405303 32.54603139457788)">
                            </path>
                            <path d="M0.331807 0L12.6282 0L12.96 6.20635L6.48 10.0921L-3.64005e-07 6.20635L0.331807 0Z"
                                shape-rendering="geometricPrecision" fill="#817F7F" style="fill-rule:evenodd"
                                transform="matrix(1 0 0 1 17.52000033200443 19)"></path>
                        </g>
                        <g>
                            <path d="M0 0L32 0L32 10L0 10L0 0Z" shape-rendering="geometricPrecision" fill="#A00000"
                                style="fill-rule:evenodd" transform="matrix(1 0 0 1 8 2)"></path>
                            <path
                                d="M32.5 -0.5L-0.5 -0.5L-0.5 10.5L32.5 10.5L32.5 -0.5ZM0.5 9.5L0.5 0.5L31.5 0.5L31.5 9.5L0.5 9.5Z"
                                stroke-dasharray="" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="1"
                                shape-rendering="geometricPrecision" fill="#616161" transform="matrix(1 0 0 1 8 2)"
                                fill-rule="evenodd">
                            </path>
                            <path d="M0 10C2.76142 10 5 7.76142 5 5C5 2.23858 2.76142 0 0 0"
                                shape-rendering="geometricPrecision" fill="#A00000" style="fill-rule:evenodd"
                                transform="matrix(1 0 0 1 39 2)"></path>
                            <path
                                d="M3.18198 8.18198Q1.86396 9.5 0 9.5L0 10.5Q2.27818 10.5 3.88909 8.88909Q5.5 7.27817 5.5 5Q5.5 2.72182 3.88909 1.11091Q2.27817 -0.5 0 -0.5L0 0.5Q1.86396 0.5 3.18198 1.81802Q4.5 3.13604 4.5 5Q4.5 6.86396 3.18198 8.18198Z"
                                stroke-dasharray="" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="1"
                                shape-rendering="geometricPrecision" fill="#616161" transform="matrix(1 0 0 1 39 2)"
                                fill-rule="evenodd"></path>
                            <path d="M0 10C2.76142 10 5 7.76142 5 5C5 2.23858 2.76142 0 0 0"
                                shape-rendering="geometricPrecision" fill="#A00000" style="fill-rule:evenodd"
                                transform="matrix(-1 1.2246467991473532e-16 -1.2246467991473532e-16 -1 9 12)"></path>
                            <path
                                d="M3.18198 8.18198Q1.86396 9.5 0 9.5L0 10.5Q2.27818 10.5 3.88909 8.88909Q5.5 7.27817 5.5 5Q5.5 2.72182 3.88909 1.11091Q2.27817 -0.5 0 -0.5L0 0.5Q1.86396 0.5 3.18198 1.81802Q4.5 3.13604 4.5 5Q4.5 6.86396 3.18198 8.18198Z"
                                stroke-dasharray="" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="1"
                                shape-rendering="geometricPrecision" fill="#616161"
                                transform="matrix(-1 1.2246467991473532e-16 -1.2246467991473532e-16 -1 9 12)"
                                fill-rule="evenodd">
                            </path>
                        </g>
                        <path d="M0 0L11 0L11 20L0 20L0 0Z" shape-rendering="geometricPrecision" fill="#D3D2D2"
                            style="fill-rule:evenodd" transform="matrix(1 0 0 1 18.5 2)"></path>
                        <path
                            d="M11.5 -0.5L-0.5 -0.5L-0.5 20.5L11.5 20.5L11.5 -0.5ZM0.5 19.5L0.5 0.5L10.5 0.5L10.5 19.5L0.5 19.5Z"
                            stroke-dasharray="" stroke-linecap="butt" stroke-linejoin="miter" stroke-width="1"
                            shape-rendering="geometricPrecision" fill="#686666" transform="matrix(1 0 0 1 18.5 2)"
                            fill-rule="evenodd">
                        </path>
                    </g>
                </svg>
                <span>Transmission Vue</span>
            </router-link>
        </div>

        <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
            <i class="pi pi-bars"></i>
        </button>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button" class="layout-topbar-action layout-topbar-action-highlight">
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-mobile"></i>
                        <span>移动UI</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-desktop"></i>
                        <span>桌面版UI</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-info-circle"></i>
                        <span>关于</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
