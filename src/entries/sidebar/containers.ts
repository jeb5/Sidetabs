import browser from "webextension-polyfill";
import container_icon_briefcase from "../../assets/container_icons/briefcase.svg?raw";
import container_icon_cart from "../../assets/container_icons/cart.svg?raw";
import container_icon_chill from "../../assets/container_icons/chill.svg?raw";
import container_icon_circle from "../../assets/container_icons/circle.svg?raw";
import container_icon_dollar from "../../assets/container_icons/dollar.svg?raw";
import container_icon_fence from "../../assets/container_icons/fence.svg?raw";
import container_icon_fingerprint from "../../assets/container_icons/fingerprint.svg?raw";
import container_icon_food from "../../assets/container_icons/food.svg?raw";
import container_icon_fruit from "../../assets/container_icons/fruit.svg?raw";
import container_icon_gift from "../../assets/container_icons/gift.svg?raw";
import container_icon_pet from "../../assets/container_icons/pet.svg?raw";
import container_icon_tree from "../../assets/container_icons/tree.svg?raw";
import container_icon_vacation from "../../assets/container_icons/vacation.svg?raw";
import { svgB64Colored } from "../utils/svgutil";
const container_icons = {
	briefcase: container_icon_briefcase,
	cart: container_icon_cart,
	chill: container_icon_chill,
	circle: container_icon_circle,
	dollar: container_icon_dollar,
	fence: container_icon_fence,
	fingerprint: container_icon_fingerprint,
	food: container_icon_food,
	fruit: container_icon_fruit,
	gift: container_icon_gift,
	pet: container_icon_pet,
	tree: container_icon_tree,
	vacation: container_icon_vacation,
};

type CustomContainer = browser.ContextualIdentities.ContextualIdentity & {
	iconB64Colored: string | null;
};

export let containers: CustomContainer[] = [];

async function rebuildContainers() {
	const rawContainers = await browser.contextualIdentities.query({});
	containers = rawContainers.map((container) => {
		const icon_svg = container_icons[container.icon as keyof typeof container_icons];
		const iconB64Colored = icon_svg ? svgB64Colored(icon_svg, container.colorCode) : null;
		return { ...container, iconB64Colored } as CustomContainer;
	});
}
browser.contextualIdentities.onRemoved.addListener(rebuildContainers);
browser.contextualIdentities.onUpdated.addListener(rebuildContainers);
browser.contextualIdentities.onCreated.addListener(rebuildContainers);
rebuildContainers();
