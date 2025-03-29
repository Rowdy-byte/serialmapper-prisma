import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const mdsvexOptions = {
	extensions: ['.md', '.svx'],

}


const config = {
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],
	extensions: ['.svelte', '.md', '.svx'],

	kit: {

		adapter: adapter(),

	}
};

export default config;
